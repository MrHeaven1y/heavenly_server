import subprocess
subprocess.run(["npm","run", "install-pip"])
subprocess.run(["npm", "start"])
subprocess.run(["python", "server.py"])