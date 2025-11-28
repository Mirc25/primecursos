@echo off
rem START or STOP Services
rem ----------------------------------
rem Check if argument is STOP or START

if not ""%1"" == ""START"" goto stop

if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\hypersonic\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\server\hsql-sample-database\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\ingres\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\ingres\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\postgresql\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\postgresql\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\openoffice\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\openoffice\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache-tomcat\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache-tomcat\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\resin\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\resin\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\jetty\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\jetty\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\subversion\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\subversion\scripts\ctl.bat START)
rem RUBY_APPLICATION_START
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\lucene\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\lucene\scripts\ctl.bat START)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\third_application\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\third_application\scripts\ctl.bat START)
goto end

:stop
echo "Stopping services ..."
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\third_application\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\third_application\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\lucene\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\lucene\scripts\ctl.bat STOP)
rem RUBY_APPLICATION_STOP
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\subversion\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\subversion\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\jetty\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\jetty\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\hypersonic\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\server\hsql-sample-database\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\resin\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\resin\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache-tomcat\scripts\ctl.bat (start /MIN /B /WAIT C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache-tomcat\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\openoffice\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\openoffice\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\ingres\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\ingres\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql\scripts\ctl.bat STOP)
if exist C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\postgresql\scripts\ctl.bat (start /MIN /B C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\postgresql\scripts\ctl.bat STOP)

:end

