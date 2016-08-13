{
	header: [
		'<i class="fa fa-hashtag" aria-hidden="true"></i>',
		'Author',
		'Language',
		'Votes',
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
		}
	},
	handleData: function(data){
		if(!data.length)
		{
			return;
		}
		var $span = $('<span>');
		
		return data.map(function(answer){
			$span.html(answer.body);
			var $h1 = $span.find(':first-child').eq(0);
				$h1.find('a').attr('target', '_blank');
				
			answer._meta = {
				lang: $h1.html(),
				lang_text: $h1.text().toLowerCase()
			};
			
			return answer;
		});
	},
	sort: function(a, b){
		if(a.score != b.score)
		{
			return b.score - a.score;
		}
		return b.creation_date - a.creation_date;
	},
	html: function(answer, index, meta){
		if(!index)
		{
			meta.classification = 1;
		}
		if(index && meta.last_score != answer.score)
		{
			meta.classification = index + 1;
		}
		meta.last_score = answer.score;
		
		return '<tr ' +
				(answer.is_accepted ? 'style="background:#e1ffdd"': '') +
				' data-answer_id="' + answer.answer_id + '" ' +
				(
					HEURISTIC_INVALID_MARK
						? 'data-heuristic-invalid-score="' + answer._meta.HEURISTIC_INVALID_SCORE + '"'
						: ''
				) +
			'>' +
			'<td data-order="' + (index + 1) + '">' +
				(
					(
						HEURISTIC_INVALID_MARK && answer._meta.HEURISTIC_INVALID && answer._meta.HEURISTIC_INVALID_SCORE < -2
							? answer._meta.HEURISTIC_INVALID.map(function(comment){
								return '<a href="' + comment.link + '" target="_blank"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></a>'
							})
							: ''
					) + ' ' + meta.classification
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
				answer.score  +
			'</td>' +
			'<td>' +
				'<a href="' + answer.link + '" target="_blank">View</a>' +
			'</td>' +
		'</tr>';
	}
}
