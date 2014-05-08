/*
    This program is distributed under the terms of the GPL license.
    Please see the LICENSE file for details.

    Copyright 2014 Francisco Esparza
*/
/*
ES:
Este archivo es el encargado de realizar los procesos principales para llevar acabo las conversaciones
El cliente funcionara mediate el protocolo XMPP y con el uso de BOSH service
EN:
This file is in charge of making the main processes talks
The client worked mediate the XMPP protocol and BOSH service
*/

//Variables necesarias para la conexion
Ximp = {
	var BOSH_SERVICE = 'http://localhost:7070/http-bind/'
	var connection = null;

	jid_to_id: function (jid) {
        return Strophe.getBareJidFromJid(jid)
            .replace(/@/g, "-")
            .replace(/\./g, "-");
    },

    on_roster: function (iq) {
        $(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid;

            // transform jid into an id
            var jid_id = Ximp.jid_to_id(jid);

            var contact = $("<li id='" + jid_id + "'>" +
                            "<div class='roster-contact offline'>" +
                            "<div class='roster-name'>" +
                            name +
                            "</div><div class='roster-jid'>" +
                            jid +
                            "</div></div></li>");

            Ximp.insert_contact(contact);
        });

        // set up presence handler and send initial presence
        Ximp.connection.addHandler(Ximp.on_presence, null, "presence");
        Ximp.connection.send($pres());
    },

     pending_subscriber: null,

    on_presence: function (presence) {
        var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid_id = Ximp.jid_to_id(from);

        if (ptype === 'subscribe') {
            // populate pending_subscriber, the approve-jid span, and
            // open the dialog
            Ximp.pending_subscriber = from;
            $('#approve-jid').text(Strophe.getBareJidFromJid(from));
            $('#approve_dialog').dialog('open');
        } else if (ptype !== 'error') {
            var contact = $('#roster-area li#' + jid_id + ' .roster-contact')
                .removeClass("online")
                .removeClass("away")
                .removeClass("offline");
            if (ptype === 'unavailable') {
                contact.addClass("offline");
            } else {
                var show = $(presence).find("show").text();
                if (show === "" || show === "chat") {
                    contact.addClass("online");
                } else {
                    contact.addClass("away");
                }
            }

            var li = contact.parent();
            li.remove();
            Ximp.insert_contact(li);
        }

        // reset addressing for user since their presence changed
        var jid_id = Ximp.jid_to_id(from);
        $('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));

        return true;
    },
	
}
$(document).ready(function () {

});