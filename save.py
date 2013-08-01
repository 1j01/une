#!/usr/bin/python
import os, cgi, cgitb; cgitb.enable()
form = cgi.FieldStorage()
print 'Content-Type: text/plain\n';
if form.has_key('json'):
	json = form['json'].value
	open('state.json', 'wb').write(json)
	print 'saved'
else:
	print 'post.json.plz'