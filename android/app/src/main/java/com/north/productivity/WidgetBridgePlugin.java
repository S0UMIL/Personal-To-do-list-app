package com.north.productivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.north.productivity.widget.NorthWidgetUpdateHelper;
import com.north.productivity.widget.WidgetLaunchRouter;
import com.north.productivity.widget.WidgetSnapshotStore;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void syncSnapshot(PluginCall call) {
        String snapshot = call.getString("snapshot");
        if (snapshot == null || snapshot.isEmpty()) {
            call.reject("snapshot is required");
            return;
        }
        WidgetSnapshotStore.save(getContext(), snapshot);
        call.resolve();
    }

    @PluginMethod
    public void requestWidgetUpdate(PluginCall call) {
        NorthWidgetUpdateHelper.updateAll(getContext());
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void getPendingWidgetRoute(PluginCall call) {
        JSObject ret = new JSObject();
        String route = WidgetLaunchRouter.consumeRoute();
        if (route != null) {
            ret.put("route", route);
        }
        call.resolve(ret);
    }
}
