Ver:
<https://help.resilio.com/hc/en-us/articles/206178924-Installing-Sync-package-on-Linux>

En desktop, seguir estos pasos:

Alternative: Running Sync under the current user
If you want to run Sync under your current user, first disable auto-launch of Sync and stop it:

sudo systemctl disable resilio-sync
sudo systemctl stop resilio-sync
Then, edit the file /usr/lib/systemd/user/resilio-sync.service and change "WantedBy=multi-user.target" to "WantedBy=default.target".

Save this file and then enable the auto-start of service with --user parameter:

systemctl --user enable resilio-sync
To start Sync under the current user execute:

systemctl --user start resilio-sync



<http://localhost:8888/gui/>

En teléfono:

<https://play.google.com/store/apps/details?id=com.resilio.sync&referrer=utm_source%3Dresilio%26utm_medium%3Ddownloads%26utm_campaign%3Dhome&pli=1>

