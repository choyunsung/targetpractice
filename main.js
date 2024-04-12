/*jshint esversion: 6 */
const electron = require('electron');

const { app, BrowserWindow, ipcMain: ipc } = electron;

var window = null;

app.on('ready', function()
{
	const electronScreen = electron.screen;

	// Create the window
	const {width, height} = electronScreen.getPrimaryDisplay().workAreaSize;

	window = new BrowserWindow(
	{
		width: width,
		height: height,
		frame: false,
		alwaysOnTop: true
	});

	window.webContents.on('did-finish-load', function()
	{
		ipc.on('event', function(event, message)
		{
			send(message.type, message);
		});

		ipc.on('elements', function(event, message)
		{
			send('elements', addToElements(message));
		});

		// TODO: There has to be a better way to prevent the visual flash. It
		// breaks the screen related tests.
		setTimeout(() => window.webContents.send('elements'), 100);
	});

	// Emitted when the window is closed.
	window.on('closed', function()
	{
		app.quit();
	});

	// and load the index.html of the app.
	window.loadURL('file://' + __dirname + '/index.html');
});

/**
 * Log an event to stdout as JSON.
 * @param  {string} event The name of the event.
 * @param  {string} msg   The event contents.
 */
function send(event, msg)
{
	let toSend;
	if (!msg)
	{
		toSend = {"event" : event};
	}
	else
	{
		toSend = {
			"event" : event,
			"message": msg
		};
	}

	console.log(JSON.stringify(toSend));
}

/**
 * Pad element positions using the Window's absolute position as an offset.
 * @param object elements An object containing the elements and their positions.
 */
function addToElements(elements)
{
	let winPos = window.getPosition();
	for (let x in elements)
	{
		elements[x].x += winPos[0];
		elements[x].y += winPos[1];
	}
	return elements;
}
