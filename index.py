#!/usr/bin/python
print """Content-Type: text/html

<!DOCTYPE html>
<html lang="en">
    <head>
		<title>UNE</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<style>html{background:#000}</style>
		<link rel="stylesheet" href="/lib/gui.css"/>
		<link rel="stylesheet" href="/une/une.css"/>
	</head>
	<body bgcoral="elkhorn">
		<div id="starmap"></div>
		<script src="/lib/gui.js"></script>
		<script>onerror=gui.err;state="""+open("state.json").read()+"""</script>
		<script src="/lib/3.js"></script>
		<script src="/lib/stats.js"></script>
		<script src="/une/une.js"></script>
		<script src="/kc.js"></script>
	</body>
</html>"""