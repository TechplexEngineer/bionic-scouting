# Bionic Scouting

Bionic Scouting is an app primarily for Android that FIRST robotics Team 4909 is developing for use at competitions. The
app aids in collecting data about other teams to inform match strategy and alliance selection.

The system is designed with the thought that there are 6 objective scouts each collecting metrics about 1 of 6 robots
during a match.

The system also supports having additional "super" scouts collecting subjective observations.

Goals:

- Support completely offline operation. Many events do not have WiFi, and some steel buildings do a great job blocking
  cellular signals.
    - Default to syncing with database in the cloud
    - Fallback to Bluetooth
    - Fallback to QR Codes for data sync
- Pull Match schedule and teams from The Blue Alliance
- Provide a quick view for the drive coach to use for match preparation
- Objective match metrics are easily configurable as they change season to season
- Strategists collect observations in preparations for upcoming matches
- Robot specific pit scouting
- Easy data export to excel
- Make all data collected viewable in the app

Hardware:

- Six 8" tablets for scouts in the stands (Red 1,2,3 and Blue 1,2,3)
- One lead scout using a tablet 10"
- Five Strategists using 8" tablets
- One lead super scout using an 8" tablet

We plan to have our Strategists pit scout on the first day of the event collecting overall observations, drivetrain
information and photos of each robot.

The data collected by the system can be exported to CSV for analysis in Excel.

## Software Architecture

Bionic Scouting is a web app that uses [SvelteKit](https://kit.svelte.dev/) with Vite for the frontend and is packaged
for android with [Capacitor.js](https://capacitorjs.com/)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a
development server:

```bash
# install dependencies
npm ci

# Run a development server
npm run dev
```

### Testing on a connected android device

When developing and testing it can be useful to test on a usb connected android device. We can do this by running a
webserver with our latest code on our development computer and instructing the app to connect to the dev server.

NOTE: Device must be connected to the same network as the host computer

```bash
npm run dev -- --host
npx cap sync
HOST=<dev computer ip> npx cap run android
```

To push the app to multiple connected devices

```bash
for dev in $(adb devices | awk '/\<device\>/ {print $1}'); do HOST=<dev computer ip> npx cap run android --target $dev; done
```

## Building

To build the frontend of the app run:

```bash
npm run build
```

To view a preview of the "production" build:

```bash
npm run preview
```

Once the frontend is built we can build the android app:

```bash
./gradlew bundleRelease \
            -PversionName="1.0.0" \
            -PversionNumber=$(date '+%s')
```

The aab will be stored in `android/app/build/outputs/`

### Our build and release process

We use GitHub Actions to build an android app on each push to the main branch.

## Sync

The app uses RxDB with an underlying PouchDB for storage which supports sync with CouchDB For the competition season we
run a CouchDB server on a Digital Ocean VPS.

When running the app locally create a .env file at the root of the repository with content:
`VITE_COUCHDB_URL=http://<USERNAME>:<PASSWORD>@<HOST>:5984/events_<year>/`
