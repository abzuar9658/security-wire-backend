import sys
import socket
import time
from datetime import datetime
from threading import Thread

threads = []
openports = []


def portScanner(start, end, ip):
    global checks
    global strings
    for port in range(int(start), int(end)):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            conn = s.connect_ex((ip, port))
            if conn == 0:
                try:
                    openports.append(["Port " + str(port), " open, service: " + str(
                        socket.getservbyport(port, 'tcp'))])
                except:
                    openports.append([
                        "Port " + str(port), " open, service: Unknown"])
        except socket.error:
            #print("Socket error.")
            s.close()
            continue
        s.close()


def main(p_url):
    url = str(p_url)
    try:
        ip = socket.gethostbyname(url)
        tno = 50
        for x in range(tno):
            if((x+1)*(450/tno) <= 450):
                th = Thread(target=portScanner, args=(
                    x*(450/tno), (x+1)*(450/tno), ip))
            else:
                th = Thread(target=portScanner, args=(
                    x*(450/tno), 450, ip))
            th.start()
            threads.append(th)
        for x in threads:
            x.join()
        # dictkeys = openports.keys()
        # dictkeys.sort()
        dictkeys = sorted(openports)
        # print(dictkeys)
        # for each in dictkeys:
        #     print(openports[each])
    except:
        pass


if __name__ == "__main__":
    main("192.168.12.5")
    print("asd", openports)


def worker(host):
    main(host)
    return openports
