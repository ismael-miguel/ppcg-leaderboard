var filter_data = {
	all: {},
	valid: {
		fn: function(answer_id){
			return this[answer_id] && this[answer_id]._meta.valid;
		}
	},
	per_lang: {
		fn: function(answer_id){
			return this[filter_data.all[answer_id]._meta.lang_text] == answer_id;
		}
	},
	invalid: {
		fn: function(answer_id){
			return !filter_data.valid.fn(answer_id);
		}
	}
};

var renderAnswers = function(){
	
	var last_size = 0;
	var classification = 1;
	var invalid_index = 0;
	
	$table.html('<thead>' +
		'<tr>' +
			'<th><i class="fa fa-hashtag" aria-hidden="true"></i></th>' +
			'<th>Author</th>' +
			'<th>Language</th>' +
			'<th>Size</th>' +
			'<th>&nbsp;</th>' +
		'</tr>' +
	'</thead>' +
	'<tbody>' +
		answers
			.sort(function(a, b){
				if(!a._meta.valid && !b._meta.valid)
				{
					return 0;
				}
				else if(!b._meta.valid)
				{
					return -1;
				}
				else if(!a._meta.valid)
				{
					return 1;
				}
				else if(a._meta.size != b._meta.size)
				{
					return a._meta.size - b._meta.size;
				}
				return a.creation_date - b.creation_date;
			})
			.map(function(answer, index){
				if(answer._meta.valid)
				{
					if(index && last_size != answer._meta.size)
					{
						classification = index + 1;
					}
					last_size = answer._meta.size;
				}
				
				return '<tr ' + (answer.is_accepted ? 'style="background:#e1ffdd"': '') + ' data-answer_id="' + answer.answer_id + '">' +
					'<td data-order="' + (answer._meta.valid ? index + 1 : answers.length - (invalid_index++)) + '">' +
						(
							answer._meta.competing
								?(
									HEURISTIC_INVALID_MARK && answer._meta.HEURISTIC_INVALID && answer._meta.HEURISTIC_INVALID_SCORE < -2
										? answer._meta.HEURISTIC_INVALID.map(function(comment){
											return '<a href="' + comment.link + '" target="_blank"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></a>'
										})
										: ''
								) + ' ' + classification
								: '<i class="fa fa-times" aria-hidden="true"></i>'
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
						(answer._meta.size === undefined
							? '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> 0'
							: answer._meta.size
						) +
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
		'<option value="valid">Valid</option>' +
		'<option value="invalid">Invalid</option>' +
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
	var $div = $('<div>');
	
	data.map(function(answer){
		var meta = answer.body.match(/<h\d>\s*([^\n,]*[^\s,]),.*?(\d+)(?=[^\n\d<>]*(?:<(?:s>[^\n<>]*<\/s>|[^\n<>]+>)[^\n\d<>]*)*<\/h\d>)/);
		
		if(meta)
		{
			$span.html(meta[1]);
			$span.find('a').attr('target', '_blank');
			
			answer._meta = {
				valid: true,
				lang: $span.html(),
				lang_text: $span.text().toLowerCase(),
				size: +meta[2],
				competing: !/<h(\d)>.*?non-?competing.*?<\/h\1>/i.test(meta[0])
			};
		}
		else
		{
			answer._meta = {
				valid: false,
				lang: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>',
				lang_text: '',
				size: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>',
				competing: false
			};
		}
		
		return answer;
	})
	.forEach(function(answer){
		
		filter_data.all[answer.answer_id] = answers[answers.length] = answer;
		
		if(!answer._meta.valid)
		{
			return;
		}
		
		filter_data.valid[answer.answer_id] = answer;
		
		if(HEURISTIC_INVALID_MARK && answer.comments && answer.comments.length)
		{
			analizeHeuristicValidity(answer);
		}
		
		if(!answer._meta.competing)
		{
			return;
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
	
	setTimeout(renderAnswers, 10);
};

handleData(answers);
