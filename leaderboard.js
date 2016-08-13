(function(window, undefined){
	'use strict';
	var QUESTION_ID = window.QUESTION_ID
		|| +(window.document.referrer + '').replace(/^https?\:\/\/codegolf\.stackexchange\.com\/questions\/(\d*)\/.*$/i, '$1');
	var FILTER = '!.DAGnbqUZ3-BwQZ*J9lkg4gEetKV*IP7TRQ864RKL_bUg8tZmbZCjUKqJLCd.c98CvmlY6ycgHu';
	var HEURISTIC_INVALID_MARK = 'HEURISTIC_INVALID_MARK' in window ? window.HEURISTIC_INVALID_MARK : true; //might work
	var ROOT = 'https://cdn.rawgit.com/ismael-miguel/ppcg-leaderboard';
	var URL = 'https://api.stackexchange.com/2.2/questions/' + QUESTION_ID + '?order=desc&sort=votes&site=codegolf&filter=' + FILTER;
	
	var answers = [];
	var question = {
		owner: undefined,
		is_answered: undefined,
		answer_count: undefined,
		question_id: undefined,
		link: undefined,
		title: undefined,
		tags: undefined,
		body: undefined
	};
	
	var tags = {
		'popularity-contest': 'popularity-contest',
		'code-golf': 'code-golf',
		'metagolf': 'code-golf',
		'king-of-the-hill': 'king-of-the-hill',
		/*'fastest-code': 'fastest-code',
		'cops-and-robers': {
			toString: function(){
				return 'cops-and-robers/' + (/cops?/i.test(question.title) ? 'cops' : 'robbers');
			}
		}*/
	};
	
	var commits = {
		'popularity-contest': '00c0821f9d524fc0c14d76a4e809a144f3a597a1',
		'code-golf': '495b70434f5377c180e01b8da7d9705cfc8dab36',
		'metagolf': '495b70434f5377c180e01b8da7d9705cfc8dab36',
		'king-of-the-hill': 'ecc976c614b8244cf805b5f6f200ebcc96fe8c7f',
		'fastest-code': '',
		'cops-and-robers': ''
	};
	
	var init = function($){
		
		//idea from http://stackoverflow.com/a/11803418/2729937
		$.when(
			$.getScript('https://cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js'),
			$.Deferred(function(deferred){
				$(deferred.resolve);
			})
		).done(function(){
			//idea from http://stackoverflow.com/a/5680757/2729937
			$('head')
				.append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" type="text/css" />')
				.append('<link rel="stylesheet" href="https://cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" type="text/css" />')
				.append('<style>body{font-family:sans-serif}a{color:#0095dd;text-decoration:none}</style>');
			
			
			$.getJSON(URL, function(data){
				if(!data.items || !data.items.length)
				{
					throw new Error('The question with ID ' + QUESTION_ID + ' doesn\'t exist');
				}
				else
				{
					
					var $table = $('<table>');
					$(document.body).append($table);
				
					for(var k in question)
					{
						question[k] = data.items[0][k];
					}
					answers = data.items[0].answers;
					
					var tag = question.tags.filter(function(tag){
						return tag in tags;
					});
					
					if(!tag.length)
					{
						console.error('The current question doesn\'t have a suitable tag for scoring. Supported tags: ' + Object.keys(tags).join(', ') + '. Current tags: ' + question.tags.join(', '));
						tag = ['popularity-contest'];
					}
					var used_tag = tag[tag.length - 1] || 'popularity-contest'
					
					$.get(ROOT + '/' + (commits[used_tag] || 'master') + '/tags/' + used_tag + '.js?_=' + Date.now(), function(code){
						var TAG;
						eval('TAG = ' + code + ';');
						
						answers = TAG.handleData(answers).sort(TAG.sort);
						
						if(HEURISTIC_INVALID_MARK)
						{
							answers = answers.map(function(answer){
								if(!answer.comments || !answer.comments.length)
								{
									answer._meta.HEURISTIC_INVALID = [];
									answer._meta.HEURISTIC_INVALID_SCORE = 0;
									return answer;
								}
								
								var score = 0;
								var last_comment_date = 0;
								answer._meta.HEURISTIC_INVALID = answer.comments.filter(function(comment){
									if(comment.owner.user_id != question.owner.user_id && !comment.score)
									{
										return false;
									}
									
									if(comment.creation_date > last_comment_date)
									{
										last_comment_date = comment.creation_date;
									}
									
									if(/\b((?:in|isn't |not )(?:valid|allowed)|wrong(?: answer| (?:in|out)put| result)|spam|broken|incorrect|(?:does(?:n'?t| not) (?:seems? to )?|won'?t |(?:will )?not )work)(?!\b(?:to|at|as|in))\b/i.test(comment.body))
									{
										score -= comment.score * (1 + (comment.owner.user_id != question.owner.user_id));
										return true;
									}
									else if(/\b(is(?: now)? valid|correct(?: answer| (?:in|out)put| result)|(?:is|was) fixed|(?:will |does )work|works as (?:intend|expect)(?:ed)?|gives? (?:me )?(?:an?)?(?:compil(?:er?|ation)) erros?)\b/i.test(comment.body))
									{
										score += comment.score * (1 + (comment.owner.user_id != question.owner.user_id));
										return false;
									}
									return false;	
								});
								answer._meta.HEURISTIC_INVALID_SCORE = score;
								
								return answer;
							});
						};
						
						var $table = $('<table>');
						var $tbody = $('<tbody>');
						var $thead = $('<thead>');
						var meta = {};
						answers.forEach(function(answer, index){
							$tbody.append(TAG.html(answer, index, meta));
						});
						$thead.html('<tr><th>' + TAG.header.join('</th><th>') + '</th></tr>');
						$(document.body).append($table.append($tbody, $thead));
						//meta = null;
						
						var $datatable = $table.DataTable($.extend(
							{
								order: [],
								lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']]
							},
							TAG.datatables
						));
						
						if(TAG.filters)
						{
							var $filters = $('<select>').html(
								'<option value="all" selected="selected">All</option>'
							).change(function(){
								$datatable.draw();
							});
							
							$('<div>')
								.css({'float': 'left'})
								.html('<label>&nbsp;Filter: </lavel>')
								.append($filters)
								.insertAfter('#DataTables_Table_0_length');
							
							var answers_per_id = {};
							answers.forEach(function(answer){
								answers_per_id[answer.answer_id] = answer;
							});
							
							for(var k in TAG.filters)
							{
								$filters.append('<option value="' + k + '">' + TAG.filters[k].label + '</option>');
								answers.forEach(function(answer){
									TAG.filters[k].append(answer, answers_per_id);
								});
							}
							
							//idea from http://stackoverflow.com/a/17539727/2729937
							$.fn.dataTable.ext.search.push(function(oSettings, aData, iDataIndex){
								var filter = $filters.val();
								
								if(filter == 'all')
								{
									return true;
								}
								
								var answer_id = oSettings.aoData[iDataIndex].nTr.getAttribute('data-answer_id');
								
								return TAG.filters[filter].fn( answer_id, answers_per_id);
							});
							
						}
						
						
					}, 'text').fail(function(e){
						console.error('An error ocurred when trying to fetch the file to calculate the leaderboard', e);
					});
				}
			}
			).fail(function(event){
				console.error('An error ocurred when trying to connect to SE API. (error ' + event.status + ': ' + event.statusText + ')');
			});
		});
	};
	
	
	// taken from http://stackoverflow.com/a/950146/2729937
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://code.jquery.com/jquery-1.9.1.min.js';
	
	script.onreadystatechange = script.onload = function(){
		window.jQuery(init);
	};
	
	document.head.appendChild(script);
	
})(Function('return this')());
