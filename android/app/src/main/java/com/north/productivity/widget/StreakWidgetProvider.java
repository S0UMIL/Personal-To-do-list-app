package com.north.productivity.widget;

public class StreakWidgetProvider extends NorthWidgetProvider {
    @Override protected String getWidgetType() { return "streak"; }
    @Override protected String getRoute() { return "/stats"; }
}
