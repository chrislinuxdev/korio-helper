import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('dash', {
    ping: () => 'pong',
});
