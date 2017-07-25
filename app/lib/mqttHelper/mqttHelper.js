var mqttHelper = {
    subscribeTopic: {
        bcgData: 'smartCare/t600BcgData',
        getSingleBcgData:function(sn){
            return this.bcgData + '/' + sn;
        },
        leaveBedData: 'smartCare/t600LeaveBedData',
        getSingleLeaveBedData: function (sn) {
            return this.leaveBedData + '/' + sn;
        },
        cmdData: 'smartCare/t600CmdData',
        getSingleCmdData: function (sn) {
            return this.cmdData + '/' + sn;
        },
        alarmData: 'smartCare/t600AlarmData',
        getSingleAlarmData: function (sn) {
            return this.alarmData + '/' + sn;
        }
    },
    publishTopic: {
        cmdData: 'smartCare/CmdAsk'
    },
    connect: MQTTconnect,
    publish: function (topic, data) {
        mqtt.send(topic, data, 0, false);
    },
    subscribe: function (topic) {
        mqtt.subscribe(topic, { qos: 0 });
    }
};

var reconnectTimeout = 2000;
var failTime = 0;
function MQTTconnect(option) {
    if (!option) {
        option = {};
    }
    mqtt = new Paho.MQTT.Client(
                        '120.26.9.196',
                        1884,
                        "web_" + parseInt(Math.random() * 100,
                        10));
    var options = {
        timeout: 3,
        useSSL: false,
        cleanSession: true,
        onSuccess: function () {
            onConnect(option.topics)
        },
        onFailure: function (message) {
            failTime++;
            console.log(message.errorMessage);
            if (failTime < 3) {
                setTimeout(MQTTconnect, reconnectTimeout);
            }
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = function (message) {
        onMessageArrived(message, option.dealData)
    };
    mqtt.connect(options);
}

function onConnect(topics) {
    if (topics && topics.length > 0) {
        for (var i = 0; i < topics.length; i++) {
            mqtt.subscribe(topics[i], { qos: 0 });
        }
    }
}

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
};

function onMessageArrived(message, dealData) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    var data = eval("(" + payload + ")");
    if (dealData) {
        dealData(topic, data);
    }
};
