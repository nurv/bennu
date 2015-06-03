/*
 * datetime.js
 * 
 * Copyright (c) 2014, Instituto Superior Técnico. All rights reserved.
 * 
 * This file is part of Bennu Toolkit.
 * 
 * Bennu Toolkit is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * Bennu Toolkit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with Bennu Toolkit. If not, see
 * <http://www.gnu.org/licenses/>.
 */

(function () {

    /** private */
    function parseTime(s){
        s = s.trim();
        if (s === ""){
            var parts = [0,0,0]
        }else{
            if (s.indexOf(".") > 0){
                var t = s.split(".");
                s = t[0];
                var mili = parseInt(t[1]);
            }else{
                var mili = 0;
            }

            var parts = s.split(":");
            parts[0] = parseInt(parts[0]);
            parts[1] = (parts[1] && parseInt(parts[1])) || 0;
            parts[2] = (parts[2] && parseInt(parts[2])) || 0;
        }

        var date = new Date();
        date.setHours(parts[0]);
        date.setMinutes(parts[1]);
        date.setSeconds(parts[2]);
        date.setMilliseconds(mili);
        return date;
    }

    /** private */
    function verifyType(e){
        e = $(e);
        if(Bennu.utils.hasAttr(e, "type")){
            if (val !== "text" && val !== "hidden"){
                console.error("Date/Time input field using non aceptable type\n" + e.prop('outerHTML'));
            }
        }
    }


    Bennu.datetime = Bennu.datetime || {};

    Bennu.datetime.createWidget = function (e) {
        var e = $(e);
        verifyType(e);
        var datetime = (e.attr("bennu-datetime") === "");
        var date = (e.attr("bennu-date") === "");
        var time = (e.attr("bennu-time") === "");

        if(datetime || (date && time)){
            return Bennu.datetime.createDateTimeWidget(e);
        }

        if(date){
            return Bennu.datetime.createDateWidget(e);
        }

        if(time){
            return Bennu.datetime.createTimeWidget(e);
        }
    }

    /** private */
    function dateOptions(e, options){
        if (Bennu.utils.hasAttr(e, "min-date")) {
            options.minDate = new Date(e.attr("min-date"));
        }

        if (Bennu.utils.hasAttr(e, "max-date")) {
            options.maxDate = new Date(e.attr("max-date"));
        }

        if (Bennu.utils.hasAttr(e, "requires-future")) {
            options.minDate = new moment();
        }

        if (Bennu.utils.hasAttr(e, "requires-past")) {
            options.maxDate = new moment();
        }

        if (Bennu.utils.hasAttr(e, "requires-future") && Bennu.utils.hasAttr(e, "requires-past")) {
            throw "Error: Due to limitations on the space-time continuum, choosing dates of past and future would break the causality principle."
        }

        if (Bennu.utils.hasAttr(e, "unavaible-dates")) {
            var dates = e.attr("unavaible-dates").split(",")
            var result = [];
            for (var i = 0; i < dates.length; i++) {
                result.add(new Date(dates[i]));
            }
            options.disabledDates = result;
        }

        if (Bennu.utils.hasAttr(e, "avaible-dates")) {
            var dates = e.attr("avaible-dates").split(",")
            var result = [];
            for (var i = 0; i < dates.length; i++) {
                result.add(new Date(dates[i]));
            }
            options.enabledDates = result;
        }

        return 
    };

    // Date Widget
    // ---------------------------------------------
    Bennu.datetime.createDateWidget = function (e) {
        e = $(e);
        verifyType(e);
        var widget = $('<div class="bennu-datetime-input-group"><div class="input-group date"><span class="input-group-addon">' +
            '<span class="glyphicon glyphicon-calendar"></span></span><input data-date-format="DD/MM/YYYY" type="text" class="bennu-datetime-input form-control"/></div><p class="help-block"></p></div>');

        var currentDate = e.val();

        if (currentDate && currentDate.trim() !== "") {
            currentDate = new Date(currentDate);
            e.val(moment(currentDate).format("YYYY-MM-DD"));
        }

        var options = {
            //locale: Bennu.locale.tag,
        };

        if(currentDate){
            options['defaultDate'] = currentDate;
        }

        dateOptions(e, options);

        $("input", widget).on("change", function (x) {
            x = $(x.target);
            var r = moment(x.val(), "DD/MM/YYYY").format("YYYY-MM-DD");
            if (r !== e.val()){
                e.val(r);
                e.trigger("change");
            }
        }).datetimepicker(options);


        e.after(widget);

        e.on("change.bennu", function(ev){
            var data = $(e).val();

            if (data.trim() == "") {
                data = new Date();
            } else {
                data = new Date(data);
            }
            e.val(moment(data).format("YYYY-MM-DD"));

            var r = $(".bennu-datetime-input", widget).data("DateTimePicker").setDate(moment(data).format("DD/MM/YYYY"))
            var t = moment(data).format("DD/MM/YYYY");

            if (r !== t){
                $(".bennu-datetime-input", widget).data("DateTimePicker").setDate(t);
            }

            e.data("handler").trigger();
        });

        e.data("input",widget);
        widget.data("related", e);

        Bennu.validation.attachToForm(widget);
        Bennu.utils.replaceRequired(e);
        return new Bennu.widgetHandler(e);
    }

    /** private */
    function timeOptions(e, options){
        if (Bennu.utils.hasAttr(e,"only-hours")) {
            options.useSeconds = false
            options.useMinutes = false
        }

        if (Bennu.utils.hasAttr(e,"no-seconds")) {
            options.useSeconds = false
            options.useMinutes = true
        }

        if (Bennu.utils.hasAttr(e,"minute-stepping")) {
            options.minuteStepping = parseInt(e.attr("minute-stepping"));
        }
    }

    Bennu.datetime.createTimeWidget = function (e) {
        e = $(e);
        verifyType(e);
        var widget = $('<div class="bennu-datetime-input-group"><div class="input-group date"><span class="input-group-addon">' +
            '<span class="glyphicon glyphicon-time"></span></span><input type="text" data-date-format="HH:mm:ss" class="bennu-datetime-input form-control"/></div><p class="help-block"></p></div>');

        var currentDate = e.val();

        if (currentDate && currentDate.trim() != "") {
            currentDate = parseTime(currentDate);
            e.val(moment(currentDate).format("HH:mm:ss.SSS"));
        }

        var options = {
            //locale: Bennu.locale.tag,
        }

        if(currentDate){
            options['defaultDate'] = currentDate;
        }

        timeOptions(e, options);

        $("input", widget).on("change", function (x) {
            x = $(x.target);

            var value = x.val()
            if (value.trim() == ""){
                var r = "";
            }else{
                var r = moment(parseTime(value)).format("HH:mm:ss.SSS");
            }

            if (r !== e.val()){
                e.val(r);
                e.trigger("change");
            }
        }).datetimepicker(options);

        e.after(widget);

        e.on("change.bennu", function(ev){
            var data = $(e).val();

            if (data.trim() == "") {
                data = new Date();
            } else {
                data = parseTime(data);
            }
            e.val(moment(data).format("HH:mm:ss.SSS"));
            var r = $(".bennu-datetime-input", widget).data("DateTimePicker").setDate(moment(data).format("HH:mm:ss"));
            var t = moment(data).format("HH:mm:ss");

            if (r !== t){
                $(".bennu-datetime-input", widget).data("DateTimePicker").setDate(t);
            }

            e.data("handler").trigger();
        });

        e.data("input",widget);
        widget.data("related", e);

        Bennu.validation.attachToForm(widget);
        Bennu.utils.replaceRequired(e);
        return new Bennu.widgetHandler(e);
    }

    Bennu.datetime.createDateTimeWidget = function (e) {
        e = $(e);
        verifyType(e);
        var widget = $('<div class="bennu-datetime-input-group"><div class="bennu-datetime-input-group input-group date"><span class="input-group-addon">' +
            '<span class="glyphicon glyphicon-calendar"></span></span><input data-date-format="DD/MM/YYYY HH:mm:ss" type="text" class="bennu-datetime-input form-control"/></div><p class="help-block"></p></div>');

        var currentDate = e.val();

        if (currentDate && currentDate.trim() != "") {
            currentDate = new Date(currentDate);
            e.val(moment(currentDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
        }

        var options = {
            //locale: Bennu.locale.tag,
            sideBySide:true,
        };

        if(currentDate){
            options['defaultDate'] = currentDate;
        }

        dateOptions(e,options);
        timeOptions(e,options);

        $("input", widget).on("change", function (x) {
            x = $(x.target);
            var value = x.val().trim()
            if (value == ""){
                e.val("");
            }else{
                var r = moment(value, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                if (r !== e.val()){
                    e.val(r);
                    e.trigger("change");
                }
            }
        }).datetimepicker(options);

        e.after(widget);
        e.data("input");
        widget.data("related", e);

        e.on("change.bennu", function(ev){
            var data = $(e).val();

            if (data.trim() == "") {
                data = new Date();
            } else {
                data = new Date(data);
            }
            e.val(moment(data).format("YYYY-MM-DDTHH:mm:ss.SSSZ"));

            var r = $(".bennu-datetime-input", widget).data("DateTimePicker").date()
            var r = (r && r.format("DD/MM/YYYY HH:mm:ss"));
            var t = moment(data).format("DD/MM/YYYY HH:mm:ss");

            if (r !== t){
                $(".bennu-datetime-input", widget).data("DateTimePicker").date(t);
            }

            e.data("handler").trigger();
        });

        e.data("input",widget);
        widget.data("related", e);

        Bennu.validation.attachToForm(widget);
        Bennu.utils.replaceRequired(e);
        return new Bennu.widgetHandler(e);
    }
}());