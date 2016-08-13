# [PPCG](http://codegolf.stackexchange.com/) leaderboard

This leaderboard works using the StackExchange API, for the Programming Puzzles & Code Golf website.

Currently, there's already an implemented version, but I've decided to make my own.

All the dependencies are already included in the file and everything is ready to go.

## How to make it work?

Simply copy and paste the following on a [Stack Snippet](https://blog.stackoverflow.com/2014/09/introducing-runnable-javascript-css-and-html-code-snippets/), inside **any** question on the website, in the `script` section:

	<!--<script>QUESTION_ID = 0;</script>-->
	<script src="https://cdn.rawgit.com/ismael-miguel/ppcg-leaderboard/master/leaderboard.js"></script>

Or, with a permalink to the commit:

	<!--<script>QUESTION_ID = 0;</script>-->
	<script src="https://cdn.rawgit.com/ismael-miguel/ppcg-leaderboard/148a2b229c78b4c55082b3be658b02c8584d68d2/leaderboard.js"></script>
	

If you have problems, you can uncomment the first line (for each choice) and manually set your question ID.

Under normal circumstances, the question will be automatically detected, using the `document.referrer` property. Some browser may not work well with it, due to security concerns.

## Any other considerations?

To deliver the file, I'm using https://rawgit.com/ which is free.  A big **thank you** to who provides the service!

StackExchange API has an hard limit of 10000 requests per day, and a limit of data per hour. I'm not sure of how much data per hour it is.

Everytime you execute the leaderboard, **1 request** is spent to fetch all comments and answers.

## Where can I see it in action?

You can visit https://jsfiddle.net/akc5f15a/19/ to check how it works and what it can do.

----------

All and any improvements are welcome!
