package com.north.productivity.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import com.north.productivity.MainActivity;
import com.north.productivity.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public final class NorthWidgetRenderer {
    private NorthWidgetRenderer() {}

    public static void update(
        Context context,
        AppWidgetManager manager,
        int appWidgetId,
        String widgetType,
        String route
    ) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_north);
        String snapshotJson = WidgetSnapshotStore.load(context);
        JSONObject snapshot = null;
        if (snapshotJson != null) {
            try {
                snapshot = new JSONObject(snapshotJson);
            } catch (Exception ignored) {
                snapshot = null;
            }
        }

        hideLines(views);
        renderWidget(views, widgetType, snapshot);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setAction(WidgetLaunchRouter.ACTION_WIDGET_OPEN);
        launch.putExtra(WidgetLaunchRouter.EXTRA_ROUTE, route);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(
            context,
            appWidgetId,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        manager.updateAppWidget(appWidgetId, views);
    }

    private static void hideLines(RemoteViews views) {
        views.setViewVisibility(R.id.widget_line1, View.GONE);
        views.setViewVisibility(R.id.widget_line2, View.GONE);
        views.setViewVisibility(R.id.widget_line3, View.GONE);
        views.setViewVisibility(R.id.widget_line4, View.GONE);
    }

    private static void renderWidget(RemoteViews views, String widgetType, JSONObject snapshot) {
        JSONObject today = snapshot != null ? snapshot.optJSONObject("today") : null;
        JSONObject quote = snapshot != null ? snapshot.optJSONObject("quote") : null;
        JSONObject google = snapshot != null ? snapshot.optJSONObject("googleTasks") : null;
        JSONObject nextFocus = snapshot != null ? snapshot.optJSONObject("nextFocus") : null;
        JSONArray areas = snapshot != null ? snapshot.optJSONArray("areas") : null;

        switch (widgetType) {
            case "today":
                views.setTextViewText(R.id.widget_label, "Today");
                if (today != null) {
                    views.setTextViewText(
                        R.id.widget_primary,
                        today.optInt("completed", 0) + " / " + today.optInt("scheduled", 0)
                    );
                    JSONArray tasks = today.optJSONArray("previewTasks");
                    if (tasks != null && tasks.length() > 0) {
                        showTaskLines(views, tasks);
                    } else {
                        views.setTextViewText(R.id.widget_secondary, "No tasks locked in");
                    }
                } else {
                    views.setTextViewText(R.id.widget_primary, "0 / 0");
                    views.setTextViewText(R.id.widget_secondary, "No tasks locked in");
                }
                break;

            case "streak":
                views.setTextViewText(R.id.widget_label, "Streak");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(snapshot != null ? snapshot.optInt("streak", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "days active");
                break;

            case "alerts":
                views.setTextViewText(R.id.widget_label, "Alerts");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(snapshot != null ? snapshot.optInt("alerts", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "priority flags");
                break;

            case "next_focus":
                views.setTextViewText(R.id.widget_label, "Next focus");
                if (nextFocus != null) {
                    views.setTextViewText(R.id.widget_primary, nextFocus.optString("title", "—"));
                    views.setTextViewText(
                        R.id.widget_secondary,
                        nextFocus.optString("priority", "medium") + " priority"
                    );
                } else {
                    boolean lockedIn = today != null && today.optBoolean("lockedIn", false);
                    views.setTextViewText(R.id.widget_primary, "—");
                    views.setTextViewText(
                        R.id.widget_secondary,
                        lockedIn ? "All clear for today" : "Lock in today's tasks first"
                    );
                }
                break;

            case "day":
                views.setTextViewText(R.id.widget_label, "Day");
                if (today != null && today.optBoolean("lockedIn", false)) {
                    views.setTextViewText(
                        R.id.widget_primary,
                        String.valueOf(today.optInt("lockedCount", 0))
                    );
                    views.setTextViewText(R.id.widget_secondary, "tasks locked in");
                } else {
                    views.setTextViewText(R.id.widget_primary, "—");
                    views.setTextViewText(R.id.widget_secondary, "not started");
                }
                break;

            case "library":
                views.setTextViewText(R.id.widget_label, "Library");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(snapshot != null ? snapshot.optInt("libraryCount", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "standing tasks");
                break;

            case "areas_today":
                views.setTextViewText(R.id.widget_label, "Areas today");
                if (areas != null && areas.length() > 0) {
                    views.setTextViewText(R.id.widget_primary, "");
                    views.setViewVisibility(R.id.widget_primary, View.GONE);
                    showAreaLines(views, areas);
                } else {
                    views.setViewVisibility(R.id.widget_primary, View.VISIBLE);
                    views.setTextViewText(R.id.widget_primary, "—");
                    views.setTextViewText(R.id.widget_secondary, "No areas linked yet");
                }
                break;

            case "daily_quote":
                views.setTextViewText(R.id.widget_label, "Daily quote");
                if (quote != null) {
                    views.setTextViewText(R.id.widget_primary, "\"" + quote.optString("text", "") + "\"");
                    views.setTextViewText(R.id.widget_secondary, "— " + quote.optString("author", ""));
                } else {
                    views.setTextViewText(R.id.widget_primary, "Open North to sync");
                    views.setTextViewText(R.id.widget_secondary, "");
                }
                break;

            case "remaining":
                views.setTextViewText(R.id.widget_label, "Remaining");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(today != null ? today.optInt("remaining", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "tasks left today");
                break;

            case "progress":
                views.setTextViewText(R.id.widget_label, "Progress");
                views.setTextViewText(
                    R.id.widget_primary,
                    (today != null ? today.optInt("progressPct", 0) : 0) + "%"
                );
                views.setTextViewText(R.id.widget_secondary, "of today's list");
                break;

            case "high_priority":
                views.setTextViewText(R.id.widget_label, "High priority");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(today != null ? today.optInt("highPriorityLeft", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "still open");
                break;

            case "google_tasks":
                views.setTextViewText(R.id.widget_label, "Google Tasks");
                if (google != null && google.optBoolean("connected", false)) {
                    views.setTextViewText(R.id.widget_primary, "Synced to North list");
                    String sub = google.optInt("syncedCount", 0) + "/" + google.optInt("todayTotal", 0)
                        + " today's tasks linked";
                    String lastSynced = google.optString("lastSyncedAt", null);
                    if (lastSynced != null && !lastSynced.isEmpty() && !"null".equals(lastSynced)) {
                        try {
                            SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                            iso.setTimeZone(TimeZone.getTimeZone("UTC"));
                            String trimmed = lastSynced.replace("Z", "").split("\\.")[0];
                            Date parsed = iso.parse(trimmed);
                            if (parsed != null) {
                                sub += " · " + DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault()).format(parsed);
                            }
                        } catch (Exception ignored) {
                            // omit time if parse fails
                        }
                    }
                    views.setTextViewText(R.id.widget_secondary, sub);
                    String syncError = google.optString("syncError", null);
                    if (syncError != null && !syncError.isEmpty() && !"null".equals(syncError)) {
                        views.setViewVisibility(R.id.widget_line1, View.VISIBLE);
                        views.setTextViewText(R.id.widget_line1, syncError);
                    }
                } else {
                    views.setTextViewText(R.id.widget_primary, "Not connected");
                    views.setTextViewText(
                        R.id.widget_secondary,
                        "Connect in Profile to sync tasks"
                    );
                }
                break;

            case "done":
                views.setTextViewText(R.id.widget_label, "Done");
                views.setTextViewText(
                    R.id.widget_primary,
                    String.valueOf(today != null ? today.optInt("done", 0) : 0)
                );
                views.setTextViewText(R.id.widget_secondary, "checked off");
                break;

            default:
                views.setTextViewText(R.id.widget_label, "North");
                views.setTextViewText(R.id.widget_primary, "Open app to sync");
                break;
        }
    }

    private static void showTaskLines(RemoteViews views, JSONArray tasks) {
        int[] lineIds = new int[] {
            R.id.widget_line1,
            R.id.widget_line2,
            R.id.widget_line3,
            R.id.widget_line4,
        };
        views.setTextViewText(R.id.widget_secondary, "");
        for (int i = 0; i < lineIds.length && i < tasks.length(); i++) {
            JSONObject task = tasks.optJSONObject(i);
            if (task == null) continue;
            boolean completed = task.optBoolean("completed", false);
            String prefix = completed ? "✓ " : "○ ";
            views.setViewVisibility(lineIds[i], View.VISIBLE);
            views.setTextViewText(lineIds[i], prefix + task.optString("title", ""));
        }
    }

    private static void showAreaLines(RemoteViews views, JSONArray areas) {
        int[] lineIds = new int[] {
            R.id.widget_line1,
            R.id.widget_line2,
            R.id.widget_line3,
            R.id.widget_line4,
        };
        views.setTextViewText(R.id.widget_secondary, "");
        for (int i = 0; i < lineIds.length && i < areas.length(); i++) {
            JSONObject area = areas.optJSONObject(i);
            if (area == null) continue;
            views.setViewVisibility(lineIds[i], View.VISIBLE);
            views.setTextViewText(
                lineIds[i],
                area.optString("label", "") + "  " + area.optInt("done", 0) + "/" + area.optInt("total", 0)
            );
        }
    }
}
