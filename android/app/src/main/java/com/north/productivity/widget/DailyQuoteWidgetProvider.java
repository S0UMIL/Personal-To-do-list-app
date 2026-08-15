package com.north.productivity.widget;

public class DailyQuoteWidgetProvider extends NorthWidgetProvider {
    @Override protected String getWidgetType() { return "daily_quote"; }
    @Override protected String getRoute() { return "/widgets"; }
}
