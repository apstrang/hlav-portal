<h1>CONCEPTS</h1>
<h2>NETWORKING</h2>
- Docker utilizes either the `host` network, or a custom (internal) network that is isolated from the host.<br>
<h3>HOST</h3><br>
	- Containers running on the `host` network utilize the host's IP address and available ports.<br>
	- Generally speaking, utilizing the `host` network mode is unadvised.<br>
<h3>CUSTOM(INTERNAL)</h3><br>
	- A custom network can be created with the following command:
		- `docker network create -d bridge <network>`<br>
		- The above syntax creates a network using the default `bridge` driver.<br>
	- Containers running on a custom network are bridged to the host. This means that services running within the network are accessible internally (container to container) via the container's name.<br>
	- To expose a service's port on the LAN, utilize the following syntax in your `docker-compose.yml`:<br>
			
		- `ports:
			  `- 3000:3000`
		- The above syntax binds port 3000 in the container to port 3000 on the host. If port 3000 is not available on the host, you can remap it using the syntax `HOST:APP`.
		- For example, if you have a Next.js app running in a container on its default port (3000) but want to access it via the host's IP address on port 4321, you would do this:
			- `ports:
				  `- 4321:3000`

<h2>IMAGES</h2>
- All Docker containers utilize a base image which can be thought of as a stripped-down operating system. 
- A wide variety of base images exist and can be found on https://hub.docker.com.
- When selecting a base image, ensure that it contains all or most of the packages required to run your app. 
- For a node.js app, a multitude of images are available at https://hub.docker.com/_/node. Each image shows the node version, along with the flavor (alpine, slim, bookworm etc). Generally, I try to use alpine or slim images for their minimal size.

<h2>EXAMPLE SETUP</h2>
- Before jumping into the next section, here's some context on my directory structure in the below examples: 
- `/mnt/user/appdata/stashtool`
	- `docker-compose.yml`
	- `reset.sh`
	- `/app`
		- `Dockerfile`
		- `requirements.txt`
		- `app.py`
		- `/routes`
		- `/services`
		- `/data`

<h2>DOCKERFILES</h2>
- Now that you've selected an image, the next step is to write a Dockerfile.
<br>
- Since we're thinking of the base image as the operating system, the Dockerfile contains the instructions for the base image to run on startup to install additional packages, provide source code, etc. We configure our "operating system" with the Dockerfile.
<br>
- Here is a sample Dockerfile: 
	
	`FROM python:3.10-slim`
	  
	ENV DEBIAN_FRONTEND=noninteractive
	WORKDIR /app
	  
	RUN apt-get update && apt-get install -y \
		curl wget gnupg unzip xauth xvfb x11vnc fluxbox \
		chromium x11-utils net-tools fonts-liberation \
		&& apt-get clean \
		&& rm -rf /var/lib/apt/lists/*
		  
	RUN pip install --no-cache-dir playwright && \
		playwright install chromium
		 
	COPY requirements.txt .
	 
	RUN pip install --no-cache-dir -r requirements.txt
	 
	COPY . .
	 
	CMD bash -c "\
		Xvfb :99 -screen 0 1920x1080x24 & \
		x11vnc -display :99 -forever -nopw -shared & \
		fluxbox & \
		export DISPLAY=:99 && \
		python app.py"`

- Now let's take things line by line to break down what's going on.
	- `FROM python:3.10-slim` 
		- This is the base image that will be built upon.
	- `ENV DEBIAN_FRONTEND=noninteractive`
		- The `python:3.10-slim` image runs on Debian. We're providing an environment variable to eliminate the GUI and utilize Debian as strictly CLI based.
	- `WORKDIR /app`
		- This tells the container that any paths we issue commands for/on will be relative to the `/app` directory.
	- `RUN apt-get update && apt-get install -y \ [...]`
		- A bit of Bash here. Most, if not all, images are Linux-based and will be interacted with using Bash.
		- This block is responsible for updating the image with `apt-get update` (the first thing we should do for any Linux distro), installing the packages `curl`, `wget`, `gnupg`, `unzip`, `xauth`, `xvfb`, `x11vnc`, `fluxbox`, `chromium`, `x11-utils`, `net-tools` and `fonts-liberation` via the command `apt-get install`. After installing, we run `apt-get clean` to clear any hanging installs. We then run `rm -rf /var/lib/apt/lists/*` to clear out any additions to the `apt` package repository we may have just caused.
	- `RUN pip install --no-cache-dir playwright && playwright install chromium`
		- We're using `pip` (included in the Python base image) to install Playwright, and then running `playwright install chromium` immediately afterward to have Playwright compile and install a compatible Chromium package within the container.
	- `COPY requirements.txt .`
		- Copies `/app/requirements.txt` to the `/` directory in the container, where we've been running these commands from.
	- `RUN pip install --no-cache-dir -r requirements.txt`
		- This installs all Python packages listed in `requirements.txt` using `pip`
	- `COPY . .`
		- Copies the contents of `/app` to `/`
	- `CMD bash -c [...]`
		- Commands for the container to run on startup. This is separate from the `RUN` commands we've been using. This block launches a VNC server in the container, configures it, and finally runs my Python app with `python app.py`

<h2>DOCKER-COMPOSE</h2>
- While Dockerfiles are ubiquitous, there are a couple of different options for configuring and starting containers - `docker-compose` and `docker run`. The former is a `.yml` file whereas the latter is a CLI tool. I greatly prefer `docker-compose` for complex stacks, visual feedback, repeatability and scalability. We *could* achieve a similar effect with `docker run`, but it would require writing a `bash` script to automate and repeat.
- Here's an example `docker-compose.yml` that is used in conjunction with the above `Dockerfile` example:

`services:`
	`web:`
		`build:`
			`context: ./app`
			`dockerfile: Dockerfile`
		`ports:`
			`- "5112:5000"`
			`- "5903:5900"`
		`volumes:`
			`- /mnt/user/appdata/stashtool/app/data:/app/data`

- First up, we have `services`
	- This defines the services you want to run in this stack (`docker-compose` can run multiple containers at once!)
- `web`
	- Defines the name of the service. I got real creative with this one.
- `build`
	- What and where are we building?
	- `context`
		- The directory we're building from. In this case, the `./app` directory. The leading `./` indicates "here", and `app` is the app directory. 
	- `dockerfile`
		- The name of the Dockerfile contained in the above `context` location.
- `ports`
	- Here we're mapping the service ports to the host. This container has two required ports. The Python app itself runs on `5000` and the VNC server runs on `5900`. These ports are already in use on the host, so I've remapped them to available ports `5112` and `5903`, respectively.
- `volumes`
	- By default, files stored in a running container *ARE NOT PERSISTENT*. They absolutely will be deleted next time you start and stop the container. For persistent storage, we need to define a volume and map it to the host. 
	- Similar to how we map ports to the host using `HOST:APP`, we use `HOST:APP` syntax for volume mappings. 
	- `/mnt/user/appdata/stashtool/app/data:/app/data`
		- The host directory `/mnt/user/appdata/stashtool/app/data` is where we'll be storing the persistent data. Within the app's context, in the container, this volume exists at `/app/data`. 
	- You can define as many volume mappings as desired as long as the path exists on the host.
