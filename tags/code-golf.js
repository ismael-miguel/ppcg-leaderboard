{
	header: [
		'<i class="fa fa-hashtag" aria-hidden="true"></i>',
		'Author',
		'Language',
		'Size',
		'&nbsp;'
	],
	datatables: {
		columnDefs: [
			{orderable: false, targets: 4},
			{searchable: false, targets: [0, 3, 4]},
			{type: 'html-num', targets: [0, 3]}
		]
	},
	filters: {
		valid: {
			data: {},
			fn: function(answer_id){
				return this.data[answer_id] && this.data[answer_id]._meta.valid;
			},
			append: function(answer){
				if(answer._meta.valid)
				{
					this.data[answer.answer_id] = answer;
				}
			},
			label: 'Valid'
		},
		per_lang: {
			data: {},
			fn: function(answer_id, all){
				return this.data[all[answer_id]._meta.lang_text] == answer_id;
			},
			append: function(answer){
				if(!answer._meta.competing)
				{
					return;
				}
				
				if(this.data[answer._meta.lang_text])
				{
					var prev_answer = filter_data.all[filter_data.per_lang[answer._meta.lang_text]];
					
					if(prev_answer._meta.size == answer._meta.size)
					{
						this.data[answer._meta.lang_text] = prev_answer.creation_date > answer.creation_date
							? answer.answer_id
							: prev_answer.answer_id;
					}
					else if(prev_answer._meta.size > answer._meta.size)
					{
						this.data[answer._meta.lang_text] = answer.answer_id;
					}
				}
				else
				{
					this.data[answer._meta.lang_text] = answer.answer_id;
				}
			},
			label: 'Per lang.'
		},
		invalid: {
			data: {},
			fn: function(answer_id){
				return this.data[answer_id] && !this.data[answer_id]._meta.valid;
			},
			append: function(answer){
				if(!answer._meta.valid)
				{
					this.data[answer.answer_id] = answer;
				}
			},
			label: 'Invalid'
		}
	},
	handleData: function(data){
		if(!data.length)
		{
			return;
		}
		var $span = $('<span>');
		//var answers = [];
		
		return data.map(function(answer){
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
		});
	},
	sort: function(a, b){
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
	},
	html: function(answer, index, meta){
		if(!index)
		{
			meta.classification = 1;
			meta.last_size = Math.MAX_VALUE;
		}
		if(answer._meta.valid)
		{
			if(index && meta.last_size != answer._meta.size)
			{
				meta.classification = index + 1;
				meta.invalid_index = 0;
			}
			meta.last_size = answer._meta.size;
		}
		
		return '<tr ' +
				(answer.is_accepted ? 'style="background:#e1ffdd"': '') +
				' data-answer_id="' + answer.answer_id + '" ' +
				(
					HEURISTIC_INVALID_MARK
						? 'data-heuristic-invalid-score="' + answer._meta.HEURISTIC_INVALID_SCORE + '"'
						: ''
				) +
			'>' +
			'<td data-order="' + (answer._meta.valid ? index + 1 : answers.length - (meta.invalid_index++)) + '">' +
				(
					answer._meta.competing
						?(
							HEURISTIC_INVALID_MARK && answer._meta.HEURISTIC_INVALID && answer._meta.HEURISTIC_INVALID_SCORE < -2
								? answer._meta.HEURISTIC_INVALID.map(function(comment){
									return '<a href="' + comment.link + '" target="_blank"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></a>'
								})
								: ''
						) + ' ' + meta.classification
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
	}
}
