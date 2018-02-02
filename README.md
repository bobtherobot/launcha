# Launch Deamons

Use a launch deamon to have the backup.sh run at specified times.


### Commands

List deamons (lists running jobs)

	launchctl list

Stop job - !!! Use the job Label, not file name. Use list above to find actual name of job (may be different from your plist file)

	launchctl stop com.gieson.launcha.backup


Remove deamon (use actual file location)

	launchctl unload /Library/LaunchDaemons/com.gieson.launcha.backups.plist

Load a job:

> NOTE: Jobs will automatically be loaded at boot if they reside in the LaunchAgents" folder.

	launchctl load /Library/LaunchDaemons/com.gieson.launcha.backups.plist

Start a job. Use the job Label, not file name.

	launchctl start com.gieson.launcha.backups


### Setup A Launch Deamon

You can put LaucnhDeamons into 2 places:

##### 1. The System Library 

	/Library/LaunchDaemons

Use this location when you want things to run as "root", but you'll have to modify the permissions to run as root as well.

Put plist into the system Library:

	/Library/LaunchDaemons

... and set proper owner / permissions:

	sudo launchctl unload /Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo cp /scripts/rsync/com.gieson.launcha.backups.plist /Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo chmod 644 /Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo chown root:wheel /Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo launchctl load /Library/LaunchDaemons/com.gieson.launcha.backups.plist



##### 2. The User's Library

	~/Library/LaunchDaemons
	
	aka
	
	/Users/YOUR_USER_NAME/Library/LaunchDaemons
	
LaunchDeamons location in a "users" Library run under the user's permissions. It would probably be wise to ensure the permissions are set properly as well.

Put plist into the system Library:

	~/Library/LaunchDaemons

... and set proper owner / permissions:

	sudo launchctl unload ~/Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo cp /scripts/rsync/com.gieson.launcha.backups.plist ~/Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo chmod 644 ~/Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo chown USER_NAME_GOES_HERE:admin ~/Library/LaunchDaemons/com.gieson.launcha.backups.plist
	sudo launchctl load ~/Library/LaunchDaemons/com.gieson.launcha.backups.plist

### Other places things can go
	
The clarity between LaunchAgents and LaunchDeamons can get stale when not used day-today, this should help:

__Agents provided by the user__

	~/Library/LaunchAgents

__Agents provided by the administrator.__

	/Library/LaunchAgents

__System-wide daemons provided by the administrator.__

	/Library/LaunchDaemons

__Agents provided by OS X.__

	/System/Library/LaunchAgents

__System-wide daemons provided by OS X.__

	/System/Library/LaunchDaemons
