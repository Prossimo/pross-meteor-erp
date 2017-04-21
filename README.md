Production server:

https://crm.prossimo.us


#### To test the app with generated fixture data

```
$ meteor npm run full-test
```

##### Test users
| username      | email              | password     |
| ------------- |:------------------:|:------------:|
| test         | test@test.com | 12345678 |
| prossimo1     | quotes@prossimo.us | P4ssiveH0use |

### Deploy 
#### Passenger + Apache2 server, Ubuntu 16.04
#### root@159.203.107.170
Apache config (main meteor-ssl.conf)
```text
$ nano /etc/apache2/sites-available/meteor-ssl.conf
$ nano /etc/apache2/sites-available/meteor.conf
```

1. Go to local project dir
```text
$ cd ../path/to/local/project
```
2. Install all dependencies
```text
$ meteor npm install
```
2-1 To check errors locally run command and then look console logs (warning is fine)
```text
$ meteor --production
```
3. Run command for building production bundle ("../build" is path to building folder)
```text
$ meteor build --server-only ../build --architecture os.linux.x86_64
```
4.After finish build go to build folder
```text
$ cd ../build
```
5. copy pross-meteor-erp.tar.gz file to server (file in build folder)
```text
$ scp pross-meteor-erp.tar.gz root@159.203.107.170:
```
6. SSH server connection 
```text
$ ssh root@159.203.107.170
```
7. Go to server project folder
```text
$ cd /var/www/meteor
```
8. Remove old app version
```text
$ rm -R bundle
```
9. Extract tar file
```text
$  tar xzf ~/pross-meteor-erp.tar.gz
```
10. Change owner to meteor user
```text
$ chown -R meteor: .
```
11. Switch to meteor user
```text
$ sudo -u meteor -H bash -l
```
12. Go to /server/ folder
```text
$ cd bundle/programs/server/
```
13. Install dependencies
```text
$ npm install --production
```
14. Back to root user
```text
$ exit
```
15. Change permissions rights /meteor/ folder 
```text
$ chmod 755 -R /var/www/meteor/
```
16. restart apache2 server
```text
$ apache2ctl restart
```
17. Go [https://crm.prossimo.us](https://crm.prossimo.us)

18. Help links:
- [deploy tutorial](https://www.phusionpassenger.com/library/walkthroughs/deploy/meteor/digital_ocean/apache/oss/xenial/install_passenger.html)
- Link to a process diagram: https://drive.google.com/open?id=0B-guFXEigZ5pR2lwOXc1Q3dQQUU
