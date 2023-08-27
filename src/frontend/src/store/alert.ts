import { writable } from "svelte/store";

export enum Alerts {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export type Alert = {
  text: string,
  level: Alerts.INFO | Alerts.SUCCESS | Alerts.WARNING | Alerts.ERROR,
  time: string,
}


function fetch_alert() {
  const { subscribe, set } = writable<Alert>({text: "bla", level: Alerts.ERROR, time: null});

  const create = (text, time=null, level) =>
    set({
      text, level, time: time || new Date().toLocaleTimeString()
    });

  const error = (text, time = null) => create(text, time, Alerts.ERROR);
  const info = (text, time = null) => create(text, time, Alerts.INFO);
  const warning = (text, time = null) => create(text, time, Alerts.WARNING);
  const success = (text, time = null) => create(text, time, Alerts.SUCCESS);
  const clear = () => set(null);

  return {
    subscribe,
    error,
    info,
    warning,
    success,
    clear
  };
}

export const alert = fetch_alert();
