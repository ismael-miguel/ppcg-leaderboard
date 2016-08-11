# [PPCG](http://codegolf.stackexchange.com/) leaderboard

This leaderboard works using the StackExchange API, for the Programming Puzzles & Code Golf website.

Currently, there's already an implemented version, but I've decided to make my own.

All the dependencies are already included in the file and everything is ready to go.

## How to make it work?

Simply copy the file and paste it on a [Stack Snippet](https://blog.stackoverflow.com/2014/09/introducing-runnable-javascript-css-and-html-code-snippets/), inside **any** question on the website (with the tag "codegolf").

If you have problems, you can uncomment the [line 5 on the file](https://github.com/ismael-miguel/ppcg-leaderboard/blob/master/leaderboard.js#L5) and replace the number with your question id.

Under normal circumstances, the question will be automatically detected, using the `document.referrer` property. Some browser may not work well with it, due to security concerns.

## Any other considerations?

StackExchange API has an hard limit of 10000 requests per day, and a limit of data per hour. I'm not sure of how much data per hour it is.

Everytime you execute the leaderboard, **1 request** is spent to fetch all comments and answers.

## Where can I see it in action?

You can visit https://jsfiddle.net/akc5f15a/14/ to check how it works and what it can do.

----------

All and any improvements are welcome!
