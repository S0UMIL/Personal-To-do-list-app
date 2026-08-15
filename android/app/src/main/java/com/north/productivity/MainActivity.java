package com.north.productivity;

import android.os.Bundle;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;
import com.north.productivity.widget.WidgetLaunchRouter;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
        WidgetLaunchRouter.handle(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        WidgetLaunchRouter.handle(intent);
    }
}
