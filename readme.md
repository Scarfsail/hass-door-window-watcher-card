# Home Assistant's Door Window Watcher Card

## About
A custom Lovelace card for the [Door Window Watcher Integration](https://github.com/Scarfsail/hass-door-window-watcher). This card provides an intuitive interface to display status and control door/window sensors in Home Assistant.

## Installation
### Preferred Installation: HACS
Install via [HACS](https://hacs.xyz/) by adding this repository as a custom repository. Then, search for and install "Door Window Watcher Card" from HACS.

### Manual Installation
1. Copy the card files into your Home Assistant configuration directory (e.g., `/config/www/hass-door-window-watcher-card/`).
2. Add the following to your Lovelace resources:
   ```yaml
   resources:
     - url: /local/hass-door-window-watcher-card/hass-door-window-watcher-card.js
       type: module
   ```

## Configuration
Add the card to your Lovelace dashboard with your preferred settings:
```yaml
type: 'custom:hass-door-window-watcher-card'
title: Door & Window Status
entity: sensor.door_window_status
# ...other configuration options...
```

## Usage
Customize the card further by overriding available options. Ensure your sensor entity matches the one configured in this card.


## License
Licensed under the MIT License.


