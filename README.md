OneBusAway Chrome extension (Angular 2)
=======================================
This is a handy little extension that lets you monitor bus stops near you for
arrival times of upcoming buses.  

### Screenshot
![Adding nearby stops](/screenshots/add_nearby_stop.gif "Adding nearby stops")

### Important notes
- Only the Puget Sound region is tested at the moment.  

### OneBusAway
- This app is powered by the [OneBusAway API](https://onebusaway.org/).  
- This app is not officially provided by OneBusAway.  

### How to run the extension
1. Make sure your local transit agency uses OneBusAway. This might be mentioned
on their website. For eg. here's [Sound Transit's](https://www.soundtransit.org/Open-Transit-Data)
open transit data website.  
1. Update `src/environments/environment.prod.ts` with the OneBusAway API key
in the `obaApiKey` variable.  
    1. The KEY can be obtained by emailing your local transit agency. For
    Sound Transit, send an email to [OBA_API_Key@soundtransit.org](mailto:OBA_API_Key@soundtransit.org?subject=API%20Key%20request).  
1. Compile the app using `ng build --prod --aot`.  
1. The `dist` folder contains the extension code. You can load this in chrome
as an **unpacked extension** by following the instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked).  