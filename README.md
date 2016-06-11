# Launcha
------------------------
By Mike Gieson [www.gieson.com](http://www.gieson.com "www.gieson.com")

Generate a plist file for use with launchd to schedule a background script / process / job to run at regular intervals and (scheduling timed jobs). This is the preferred replacement for cron "at jobs" and "periodic jobs" on Mac OS X.
- Simple time configuration
- Generates clean plist XML, which can easily be modified by hand.

Resulting files should be stored in the ~/Library/LaunchAgents folder:

```
    /Users/__YOU__/Library/LaunchAgents/com.you.launcha.MyJob.plist
```	

##### Preview or use online at:
[http://www.gieson.com/Library/projects/utilities/launcha]("http://www.gieson.com/Library/projects/utilities/launcha")


# Some notes on launchd
Here are a few commands you may need to get setup.

##### List running jobs
```sh
$ launchctl list
```
##### Load a job 
NOTE: Jobs will automatically be loaded at boot if they reside in the "LaunchAgents" folder.
```sh
$ launchctl load ~/Library/LaunchAgents/com.gieson.launcha.MyJob.plist
```

##### Unload a job
```sh
$ launchctl unload ~/Library/LaunchAgents/com.gieson.launcha.MyJob.plist
```

##### Start a job 
(use the job Label discovered after listing jobs (not the file name))
```sh
$ launchctl start com.gieson.launcha.MyJob.060000-0235-0101-0202-0000X
```
##### Stop a job 
(use the job Label discovered after listing jobs (not the file name))
```sh
$ launchctl stop com.gieson.launcha.MyJob.06000000X
```




