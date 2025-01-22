import { LitElement, html } from "lit-element"
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant } from "../../hass-frontend/src/types";
import type { LovelaceCard } from "../../hass-frontend/src/panels/lovelace/types";
import type { LovelaceCardConfig } from "../../hass-frontend/src/data/lovelace/config/card";

interface DoorWindowWatcherCardConfig extends LovelaceCardConfig {
    entity: string;

}

@customElement("door-window-watcher-card")
export class DoorWindowWatcherCard extends LitElement implements LovelaceCard {

    private config?: DoorWindowWatcherCardConfig;


    @property({ attribute: false }) hass?: HomeAssistant;

    getCardSize() {
        return this.config?.card_size ?? 1;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<Partial<DoorWindowWatcherCardConfig>> {
        return {
          type: `custom:door-window-watcher-card`,
          entity: "binary_sensor.door_window_watcher_alert",
        };
      }
    async setConfig(config: DoorWindowWatcherCardConfig) {
        this.config = config;
    }
    
    public getLayoutOptions() {
        return {
          grid_rows: 2,
          grid_columns: 12,
          grid_min_rows: 1,
        };
      }

    render() {

        if (!this.config) {
            return "Config is not defined";
        }
      
        return html`
            <ha-card>
                Hello world from the door window watcher card
            </ha-card>
        `
 }

}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'door-window-watcher-card',
  name: 'Door Window Watcher Card',
  description: 'Card for Door Window Watcher Integration',
  preview: true,
});