# Home automation hub
The hub functionalities. The host process and the child device processes that is required to run on the host machine(such as raspberry pi) and on the hub devices (particle photon devices). Used for registering/unregistering hub/devices to the home automation system and host embedded part of the whole system using an interactive cli program.

Hubs in the home automation project is basically a set of devices which ensures one or multiple task to be performed on the world. For example, a hub can consist of:
- A board (particle photon)
- Moisture sensor
- Water pump
- Led indicators

For the time being, each hub is dedicated to work on a specific context. The example hub above is just a good old plant water system. Hubs would typically run on based on user defined configs, which we are calling `profile` (a preset of the functionalities), eg. it's the users decision whether the automatic watering would happen or not and such will be defined in the values of a `profile`. In summary, a hub would reflect the behaviour describe by the user in the hub `profile`

Codes run on such hubs are controlled and run from the host process of this hub repository. The board specific codes can be found under `board` directory.

## Local setup
There are couple of things needed to be taken care of.

### Prerequisites
- Node.js v12 LTS
- Particle photon device/s
  - Expansion shield and power pack would be nice to have. Enables working in wireless mode using a battery and also allows monitoring battery status
  - First time setup for a device requires wired connection
- Complete device claiming process in particle. Run a sample program to check if the device is not deffective.
- Before a device can be worked with the system, it needs to be flashed with [voodoospark](https://github.com/voodootikigod/voodoospark) and ready to run javascript. Run a sample program.
- [JohnnyFive and voodoospark](https://github.com/rwaldron/particle-io)
- [Step by step video guide](https://www.youtube.com/watch?v=jhism2iqT7o)
- [Useful text guide](http://thinglabs.io/workshop/js/weather/setup-photon/)

### Steps
- Clone the repository
- Install dependencies
- If the home automation server running locally
  - Copy the `server.cert` from the server folder and paste it here in the root
  - Enable `httpAgent` in `apiServices.js`
- Run by `yarn deviceManagement` or `npm run deviceManagement`

### Tips & Tricks
- [Particle photon's mode led states and meaning](https://docs.particle.io/tutorials/device-os/led/photon/)
- To switch particle photon WiFi connection
  - Connect the device via usb, wait few seconds to let it boot up properly. Green led should be flashing meaning, it is looking to connect to the internet.
  - Press and hold the setup button the led starts flashing blue.
  - Run `particle serial wifi`. Search for WiFi and select your desired network.
  - Enter password when asked. Voila!
- There could be trouble while flashing the voodoospark to the particle photon board. If it is `PIN_MAP` related
  - Take a look at [this issue](https://community.particle.io/t/photon-and-the-pin-map-challenge/12223/31)
  - As a temporary solution, remove the condition wrapping the line: `STM32_Pin_Info* PIN_MAP = HAL_Pin_Map();`
- The battery monitoring works only when photon is powered through the power shield
  - The power shield has a MAX17043 battery monitor built in and connected via i2c at address `0x36`
  - At address `0x02` and `0x04` located `VCELL` and `SOC` register of the MAX17043 correspondingly
  - The factors and calculations are based on the datasheet of MAX17043
    - VCELL returns 12bit data
    - VSOC returns 16bit data
    - MAX17043-MAX17044 and MAX17048-MAX17049 has some differences between them but the implementations are very similar
      - [MAX17043-MAX17044 datasheet](https://datasheets.maximintegrated.com/en/ds/MAX17043-MAX17044.pdf)
      - [MAX17048-MAX17049 datasheet](https://datasheets.maximintegrated.com/en/ds/MAX17048-MAX17049.pdf)
  - Helpful references
    - [LipoFuelGuage](https://github.com/awelters/LiPoFuelGauge)
    - [node-max17084](https://github.com/pilotniq/node-max17084)
    - [ArduinoLib_MAX17043](https://github.com/lucadentella/ArduinoLib_MAX17043)
    - [PowerShield](https://github.com/particle-iot/PowerShield)
