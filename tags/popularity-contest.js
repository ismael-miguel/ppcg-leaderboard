var filter_data = {
	all: {},
	per_lang: {
		fn: function(answer_id){
			return this[filter_data.all[answer_id]._meta.lang_text] == answer_id;
		}
	}
};

var renderAnswers = function(){
	
	var last_score = 0;
	var classification = 1;
	var invalid_index = 0;
	
	$table.html('<thead>' +
		'<tr>' +
			'<th><i class="fa fa-hashtag" aria-hidden="true"></i></th>' +
			'<th>Author</th>' +
			'<th>Language</th>' +
			'<th>Votes</th>' +
			'<th>&nbsp;</th>' +
		'</tr>' +
	'</thead>' +
	'<tbody>' +
		answers
			.sort(function(a, b){
				if(a.score != b.score)
				{
					return b.score - a.score;
				}
				return b.creation_date - a.creation_date;
			})
			.map(function(answer, index){
				
				if(index && last_score != answer.score)
				{
					classification = index + 1;
				}
				last_score = answer.score;
				
				return '<tr ' + (answer.is_accepted ? 'style="background:#e1ffdd"': '') + ' data-answer_id="' + answer.answer_id + '">' +
					'<td data-order="' + (answer._meta.valid ? index + 1 : answers.length - (invalid_index++)) + '">' +
						(
							(
								HEURISTIC_INVALID_MARK && answer._meta.HEURISTIC_INVALID && answer._meta.HEURISTIC_INVALID_SCORE < -2
									? answer._meta.HEURISTIC_INVALID.map(function(comment){
										return '<a href="' + comment.link + '" target="_blank"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></a>'
									})
									: ''
							) + ' ' + classification
						) +
					'</td>' +
					'<td>' +
						'<a href="' + answer.owner.link + '" target="_blank">' +
							answer.owner.display_name +
						'</a>' +
					'</td>' +
					'<td>' +
						answer._meta.lang +
					'</td>' +
					'<td data-order="' + (index + 1) + '">' +
						answer.score +
					'</td>' +
					'<td>' +
						'<a href="' + answer.link + '" target="_blank">View</a>' +
					'</td>' +
				'</tr>';
			}).join('') +
	'</tbody>');
	
	var $datatable = $table.DataTable({
		order: [],
		columnDefs: [
			{orderable: false, targets: 4},
			{searchable: false, targets: [0, 3, 4]},
			{type: 'html-num', targets: [0, 3]}
		]
	});
	
	var $filters = $('<select>').html(
		'<option value="all" selected="selected">All</option>' +
		'<option value="per_lang">Per Lang.</option>'
	).change(function(){
		$datatable.draw();
	});
	
	$('<div>')
		.css({'float': 'left'})
		.html('<label>&nbsp;Filter: </lavel>')
		.append($filters)
		.insertAfter('#DataTables_Table_0_length');
	
	//idea from http://stackoverflow.com/a/17539727/2729937
	$.fn.dataTable.ext.search.push(function(oSettings, aData, iDataIndex){
		var filter = $filters.val();
		
		if(filter == 'all')
		{
			return true;
		}
		
		var answer_id = oSettings.aoData[iDataIndex].nTr.getAttribute('data-answer_id');
		
		return filter_data[filter].fn(answer_id);
	});
}

var handleData = function(data){
	if(!data.length)
	{
		return;
	}
	var $span = $('<span>');
	var answers = [];
	
	data.map(function(answer){
		$span.html(answer.body);
		var $h1 = $span.find(':first-child').eq(0);
			$h1.find('a').attr('target', '_blank');
			
		answer._meta = {
			lang: $h1.html(),
			lang_text: $h1.text().toLowerCase()
		};
		
		return answer;
	})
	.forEach(function(answer){
		
		filter_data.all[answer.answer_id] = answers[answers.length] = answer;
		
		if(HEURISTIC_INVALID_MARK && answer.comments && answer.comments.length)
		{
			analizeHeuristicValidity(answer);
		}
		
		if(filter_data.per_lang[answer._meta.lang_text])
		{
			var prev_answer = filter_data.all[filter_data.per_lang[answer._meta.lang_text]];
			
			if(prev_answer._meta.size == answer._meta.size)
			{
				filter_data.per_lang[answer._meta.lang_text] = prev_answer.creation_date > answer.creation_date
					? answer.answer_id
					: prev_answer.answer_id;
			}
			else if(prev_answer._meta.size > answer._meta.size)
			{
				filter_data.per_lang[answer._meta.lang_text] = answer.answer_id;
			}
		}
		else
		{
			filter_data.per_lang[answer._meta.lang_text] = answer.answer_id;
		}
	});
	
	setTimeout((function(){
		renderAnswers(this);
	}).bind(answers), 10);
};

handleData(answers);
