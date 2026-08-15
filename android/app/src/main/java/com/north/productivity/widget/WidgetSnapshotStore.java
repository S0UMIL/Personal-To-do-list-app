package com.north.productivity.widget;

import android.content.Context;
import android.content.SharedPreferences;

public final class WidgetSnapshotStore {
    private static final String PREFS_NAME = "north_widget_snapshot";
    private static final String KEY_SNAPSHOT = "snapshot_json";

    private WidgetSnapshotStore() {}

    public static void save(Context context, String snapshotJson) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_SNAPSHOT, snapshotJson).apply();
    }

    public static String load(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_SNAPSHOT, null);
    }
}
