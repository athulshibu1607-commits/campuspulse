# CampusPulse

Camera-free campus shutdown and security platform (hackathon prototype). It has all 8 features from the spec, and one real hardware path: ESP32 → Arduino Nano → Relay 1 → socket, wired to Room 104.

## Run it (Windows)

1. Install **Node.js 18 or newer** from https://nodejs.org (LTS). Nothing else is needed and there is no `npm install`.
2. Double-click **`start.bat`**, or open a terminal in this folder and run `node server.js`.
3. Open **http://localhost:3000**. Phones on the same Wi-Fi can use the `http://<laptop-ip>:3000` address that the terminal prints.

Demo PINs: **Security `0000`** · **Admin `1234`**

## Wire in the real device

1. Open `firmware/campuspulse_esp32/campuspulse_esp32.ino` in the Arduino IDE.
2. Set `WIFI_SSID` and `WIFI_PASS`.
3. **Make the `NANO_CMD_ON` / `NANO_CMD_OFF` strings match what your existing Nano sketch listens for**, and check the RX/TX pins and baud rate. Leave the Nano firmware unchanged.
4. Flash the ESP32 and open the Serial Monitor at 115200. It prints its IP address.
5. In the app, go to More → Settings → ESP32 address, enter `http://<that-ip>`, then Save and Test.

The ESP32 reports a relay state only when the Nano acknowledges a command. If no reply comes back, the state is UNKNOWN and Room 104 shows grey, never green. Every result screen says "Physical state not independently verified".

**No hardware handy?** Run `node tools/mock-esp32.js` in a second terminal and set the address to `http://localhost:8081`. The app labels it **Mock controller — not real hardware**. In the mock's terminal, type `off`, `on`, `down` or `up` to simulate events.

## 3-minute demo script

Log in as Admin. In More → Settings, set **Clock speed = "1 min = 4 s"** and the **cancel window** to 120 s (or 20 s for a fast run).

1. **Digital Twin.** Room 104 is the physical room; the blue dashed rooms are simulated.
2. **Settings → "Start sweep now".** Open **Sweep**. Mark one room *Turned off*. Mark another *Still occupied*: an exception form opens; approve it under Exceptions.
3. **Closing arrives** after 15 policy minutes, which is about 1 minute here. Rooms go red, with T+0 → T+15 → T+25 on the Home timeline.
4. **Shutdown preview.** Home → "Turn off eligible devices…" → pick a floor. Protected devices are locked. Confirm, then **Cancel** during the window: the request is logged as never sent.
5. **Ask-the-Log.** Search `104 shutdown`, then try `zebra` to show "No records found". Export CSV.
6. If there's time: **Floor Streaks** and **Repeat Issues** (Room 203 is pre-flagged).

To start over: Settings → **Reset demo data**, or delete the `data/` folder.

## Rules the build enforces

- No camera, no energy meter, no kWh/money figures. Streaks are counts only.
- Room 104 is the only physical room. Everything else is a labelled simulated record.
- A room is green only if its controller is online and reporting OFF. Offline or unknown is grey.
- Every exception needs a reason and an end time, and expires automatically.
- A floor-wide shutdown has a 2-minute cancel window. A cancelled request is never sent.
- A streak breaks on an unresolved alert. Here that means an alert still open, or one that was only closed by an automatic shutdown.
- Roles: **Admin** has full access and the full audit log. **Security** gets sweep, alerts, shutdown requests and exception requests, and sees operational log entries plus its own actions.

## Files

```
server.js                  backend: engine, audit log, API, ESP32 bridge (no dependencies)
public/                    mobile web app (index.html, app.js, styles.css)
firmware/campuspulse_esp32 ESP32 gateway sketch
tools/mock-esp32.js        fake controller for rehearsal
data/state.json            created on first run; delete it to reseed
```
