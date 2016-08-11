(function(window, undefined){
	'use strict';
	var QUESTION_ID = window.QUESTION_ID
		|| +(window.document.referrer + '').replace(/^https?\:\/\/codegolf\.stackexchange\.com\/questions\/(\d*)\/.*$/i, '$1');
	var FILTER = '!.DAGnbqUZ3-BwQZ*J9lkg4gEetKV*IP7TRQ864RKL_bUg8tZmbZCjUKqJLCd.c98CvmlY6ycgHu';
	var HEURISTIC_INVALID_MARK = 'HEURISTIC_INVALID_MARK' in window ? window.HEURISTIC_INVALID_MARK : true; //might work
	// need a real host for this
	var ROOT = 'https://raw.githubusercontent.com/ismael-miguel/ppcg-leaderboard/master';

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
		'code-golf': 'code-golf',
		'metagolf': 'code-golf',
		'king-of-the-hill': 'king-of-the-hill',
		'fastest-code': 'fastest-code',
		'cops-and-robers': {
			toString: function(){
				return 'cops-and-robers/' + (/cops?/i.test(question.title) ? 'cops' : 'robbers');
			}
		},
		'popularity-contest': 'popularity-contest',
		'fastest-code': 'fastest-code'
	};
	
	var analizeHeuristicValidity = function(answer){
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
			
			if(/\b((?:in|isn't |not )valid|wrong(?: answer| (?:in|out)put| result)|spam|broken|incorrect|(?:does(?:n'?t| not) (?:seems? to )?|won'?t |will not )work)(?!\b(?:to|at|as|in))\b/i.test(comment.body))
			{
				score -= comment.score * +(comment.owner.user_id != question.owner.user_id);
				return true;
			}
			else if(/\b(is(?: now)? valid|correct(?: answer| (?:in|out)put| result)|(?:is|was) fixed|(?:will |does )work|works as (?:intend|expect)(?:ed)?|gives? (?:me )?(?:an?)?(?:compil(?:er?|ation)) erros?)\b/i.test(comment.body))
			{
				score += comment.score * +(comment.owner.user_id != question.owner.user_id);
				return false;
			}
		});
		
		answer._meta.HEURISTIC_INVALID_SCORE = score;
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
			
			
			$.getJSON(
				'https://api.stackexchange.com/2.2/questions/' + QUESTION_ID + '?order=desc&sort=votes&site=codegolf&filter=' + FILTER,
				function(data){
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
							})
							|| 'popularity-contets'; //sorts based on votes
						
						if(!tag.length)
						{
							throw new Error('The current question doesn\'t have a suitable tag for scoring. Supported tags: ' + Object.keys(tags).join(', ') + '. Current tags: ' + question.tags.join(', '));
						}
						
						$.get(ROOT + '/tags/' + tag[tag.length - 1] + '.js?_=' + Math.random(), function(code){
							Function('HEURISTIC_INVALID_MARK', 'analizeHeuristicValidity', 'question', 'answers', '$table', '"use strict";' + code)(HEURISTIC_INVALID_MARK, analizeHeuristicValidity, question, answers, $table);
						}).fail(function(){
							console.error('An error ocurred when trying to fetch the file to calculate the ');
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
