import threading
import psycopg2
import json
from flask import Flask, request
from flask_socketio import SocketIO
import logging
import time
import datetime


# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)
# handler = logging.StreamHandler(logging.sys.stdout)
# logger.addHandler(handler)
app = Flask(__name__)
app.config['ENGINEIO_PREFER_WEBSOCKETS']= True
socket = SocketIO(app, cors_allowed_origins="*", allow_upgrades=True, async_mode="eventlet", logger=True)

cert = "famnkunf_xyz.crt"
key = "famnkunf_xyz.key"
ca = "famnkunf_xyz.ca-bundle"
    
# @app.get("/")
# def test():
#     return "Functional"

connectedClient = {}

with psycopg2.connect(
    host="localhost",
    database="remote_management",
    user="postgres",
    password="famnkunf",
    port=5432
) as pg_conn:
    pg_cursor = pg_conn.cursor()
    pg_cursor.execute("create table if not exists data (id serial primary key, temperature float, humidity float, rain boolean, roof boolean, time timestamp);")
    pg_conn.commit()
    lock = threading.Lock()
        
    @socket.on('connect')
    def connect():
        print('Connect', request.sid)
        
    @socket.on('disconnect')
    def disconnect():
        try:
            connectedClient.pop(request.sid)
        except:
            pass
        print('disconnect', request.sid)

    @socket.on('clientType')
    def clientType(message=""):
        print(message)
        connectedClient[request.sid] = message
        print(connectedClient)
        socket.emit('clientType', request.sid, to=request.sid)
        
        
    
    @socket.on('status')
    def send_status(message=""):
        socket.emit('status', True, to=request.sid)

    @socket.on('roofStatus')
    def send_roof_status(message=""):
        print("Receiving roof status from client", request.sid)
        for key, value in connectedClient.items():
            if value == "device":
                socket.emit('roofStatus', message, to=key)
    
    @socket.on('sensorData')
    def save_sensor_data(message=""):
        data = message
        print(data)
        temperature = str(data["temperature"])
        humidity = str(data["humidity"])
        rain = True if data["rain"] == 1 else False
        roof = True if data["roof"] == 1 else False
        time = datetime.datetime.now()
        print("Saving to database")
        try:
            pg_cursor.execute("insert into data(temperature, humidity, rain, roof, time) values(%s, %s, %s, %s, %s)", [temperature, humidity, rain, roof, time])
            pg_conn.commit()
            print("Received data: temperature: {}, humidity: {}, rain: {}, roof: {}, time: {}".format(temperature, humidity, rain, roof, time))
            socket.emit('sensorData', "Received message", to=request.sid)
        except Exception as e:
            print("Error saving data to database:", e)
        
    @socket.on_error()
    def error_handle(e):
        print("ERROR", e)
        
    @socket.on('data')
    def send_data(count=5):
        pg_cursor.execute("select * from data order by time desc LIMIT %s", [count])
        pg_data = pg_cursor.fetchall()
        # data = {
        #     "temperature": pg_data[1],
        #     "humidity": pg_data[2],
        #     "rain": pg_data[3],
        #     "door": pg_data[4],
        #     "time": pg_data[5].strftime("%Y-%m-%d %H:%M:%S")
        # }
        data_list = []
        for d in pg_data:
            # TODO: Convert the format to UTC for standardization
            date: datetime.datetime = d[5]
            e = {
                "temperature": d[1],
                "humidity": d[2],
                "rain": d[3],
                "roof": d[4],
                "time": date.isoformat()
            }
            data_list.append(e)
        socket.emit('data', data_list, to=request.sid)
        for key, value in connectedClient.items():
            if value == "device":
                print("Send data to device")
                socket.emit("requestData", "1", to=key)
    @socket.on('node.roofReady')
    def roofReady(message=""):
        for key, value in connectedClient.items():
            if value == "web":
                socket.emit('roofReady', message, to=key)
    if __name__ == '__main__':
        socket.run(app=app, host="0.0.0.0", port=5555, ca_certs=ca, certfile=cert, keyfile=key, debug=True)
        