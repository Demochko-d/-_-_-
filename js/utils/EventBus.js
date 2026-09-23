"use strict";
GameApp.utils.EventBus = class { constructor() { this.listeners = {}; } on(name, handler) { (this.listeners[name] ??= []).push(handler); } emit(name, data) { (this.listeners[name] ?? []).forEach((handler) => handler(data)); } };
