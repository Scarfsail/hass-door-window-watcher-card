import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit-element"
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "../hass-frontend/src/types";
import type { LovelaceCard } from "../hass-frontend/src/panels/lovelace/types";
import type { LovelaceCardConfig } from "../hass-frontend/src/data/lovelace/config/card";
import { OpenSensorInfo } from "./models";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import { getDurationMmSs } from "./time_utils";
import { classMap } from "lit/directives/class-map.js";
import { keyed } from 'lit/directives/keyed.js';

dayjs.extend(duration);

interface DoorWindowWatcherCardConfig extends LovelaceCardConfig {
    entity: string;

}

@customElement("door-window-watcher-card")
export class DoorWindowWatcherCard extends LitElement implements LovelaceCard {

    private config?: DoorWindowWatcherCardConfig;
    @state() private _hass?: HomeAssistant;

    public set hass(value: HomeAssistant) {
        const entity_old = this.config ? this._hass?.states[this.config.entity] : undefined;
        const entity_new = this.config ? value?.states[this.config.entity] : undefined;
        if (entity_new) {
            if (entity_old?.state != entity_new.state) {
                console.log("State changed", entity_old?.state, entity_new.state);
                this.expanded = entity_new.state == "on";
            }
        }
        this._hass = value;

    }

    getCardSize() {
        return this.config?.card_size ?? 1;
    }

    @state() private expanded = false;

    public static async getStubConfig(hass: HomeAssistant): Promise<Partial<DoorWindowWatcherCardConfig>> {
        return {
            type: `custom:door-window-watcher-card`,
            entity: "binary_sensor.door_window_watcher_alert",
        };
    }
    async setConfig(config: DoorWindowWatcherCardConfig) {
        this.config = config;
    }
    /*
        public getLayoutOptions() {
            return {
                grid_rows: 2,
                grid_columns: 12,
                grid_min_rows: 1,
            };
        }
    */
    static styles = css`
        .alert-active{color:var(--error-color)}
        .countdown-active{color:var(--warning-color)}
        .inactive{color:var(--primary-text-color)}
        .sensor-card{
            margin: 5px;
            padding: 5px;
            padding-left: 10px;
        }
        .sensor-title{
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        .elapsed-time{
            opacity: 0.6;
            margin-left: 10px;
            font-size:12px;
        }        
        .sensor-actions{
            display: flex;
            align-items: center;
        }
        .animate-fading{
            animation:fading 2s infinite
        }@keyframes fading{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}
        .header-icon{
            cursor: pointer;
            margin-top: 5px;
            margin-bottom: 5px;
            text-align: center;
        }
    `
    render() {

        if (!this.config) {
            return "Config is not defined";
        }
        const entity = this._hass?.states[this.config.entity];
        if (!entity) {
            return `Entity ${this.config.entity} not found`;
        }

        const open_sensors = this.sortSensors(entity.attributes.open_sensors as OpenSensorInfo[])
        const iconClass = { "alert-active": entity.state == "on", "countdown-active":entity.state != "on" && open_sensors.some(s => s.remaining_seconds > 0), "header-icon": true };
        return html`
            <ha-card>
                <div class=${classMap(iconClass)} @click=${() => this.expanded = !this.expanded} >
                    <ha-icon icon="mdi:window-open-variant"></ha-icon>
                </div>
                ${this.expanded ? html`
                    <div>
                        ${open_sensors.map(sensor => keyed(sensor.entity_id, this.renderSensor(sensor)))}
                    </div>` : ""}
            </ha-card>
        `
    }

    private sortSensors(sensors: OpenSensorInfo[]) {
        return sensors.sort((a, b) => {
            if (a.alert_triggered && !b.alert_triggered)
                return -1;
            if (!a.alert_triggered && b.alert_triggered)
                return 1;

            if (a.remaining_seconds > 0 && b.remaining_seconds > 0)
                return a.remaining_seconds - b.remaining_seconds

            if (a.remaining_seconds > 0)
                return -1;

            if (b.remaining_seconds > 0)
                return 1;

            return a.opened_at > b.opened_at ? 1 : -1;
        });
    }

    private renderSensor(sensor: OpenSensorInfo) {
        const state = this._hass?.states[sensor.entity_id];
        const color_class = { "alert-active": sensor.alert_triggered, "countdown-active": sensor.remaining_seconds > 0, "inactive": !sensor.alert_triggered && sensor.remaining_seconds <= 0 };
        //${this.renderStateIcon(sensor.entity_id)}

        return html`
            <ha-card class="sensor-card">
                <div class=${classMap({ ...color_class, "sensor-title": true })}>
                ${state?.attributes.friendly_name}    
                <span class=${classMap({ ...color_class, "elapsed-time": true })}>
                        <ha-icon style=" --mdc-icon-size: 18px" icon="mdi:clock-outline"></ha-icon>                    
                        <span>${getDurationMmSs(sensor.opened_at)}</span> 
                </span>
            </div>
                <div class="sensor-actions">
                    <span class=${classMap({ ...color_class, "animate-fading": sensor.alert_triggered })}>
                        ${sensor.remaining_seconds > 0 || sensor.alert_triggered ? html`<ha-icon icon="mdi:alert-circle"></ha-icon>` : ""}
                        <span>${getDurationMmSs(dayjs().subtract(sensor.remaining_seconds, "second"))}</span>
                    </span>            
                    <ha-button @click=${() => this.callService("adjust_remaining_seconds", { seconds: 300 }, sensor.entity_id)}>+5 m</ha-button>
                    ${sensor.remaining_seconds > 0 ? html`<ha-button @click=${() => this.callService("adjust_remaining_seconds", { seconds: -300 }, sensor.entity_id)}>-5 m</ha-button>` : ""}                    
                    ${sensor.remaining_seconds > 0 || sensor.alert_triggered ? html`<ha-button @click=${() => this.callService("dismiss_alert", {}, sensor.entity_id)}><ha-icon icon="mdi:close"></ha-icon></ha-button>` : ""}

                </div>
            </ha-card>
        `
    }

    private callService(service: string, data: any, entity_id: string) {
        if (!this._hass) {
            return;
        }

        data = { ...data, ...{ entity_id: entity_id } };
        console.log("Calling service", service, data);
        this._hass.callService("door_window_watcher", service, data);
    }

    private renderStateIcon(entityId: string): TemplateResult {
        if (!this._hass) {
            return html``;
        }

        const config = {
            entity: entityId,
            state_color: true
        }

        let element = this.shadowRoot?.getElementById(entityId) as any;
        if (!element) {
            element = document.createElement('hui-state-icon-element') as any;
            element.id = entityId;
        }
        element.setConfig(config);
        element.hass = this._hass;

        return html`${element}`;
    }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'door-window-watcher-card',
    name: 'Door Window Watcher Card',
    description: 'Card for Door Window Watcher Integration',
    preview: true,
});