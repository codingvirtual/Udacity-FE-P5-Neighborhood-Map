## Front-End Nanodegree: Project 5 - Neighborhood Map


#### CONTENTS ####

-A- Project Details
        Application Overview
        Requirements (From Udacity)
        Instructor Notes (From Udacity)
-B- Project Files
-C- Installation/Use
-D- Customizing the Application


#### -A- PROJECT DETAILS ####

Application Overview
####################

This is a web application that provides some rudimentary map and filtering
functions for some points of interest on or around the Las Vegas Strip.

The application shows a list of pre-defined locations and by default, is set
to "Show All" from a filtering point of view. A drop-down filter menu allows
you to restrict the list of locations to specific categories.

Clicking on a location will display a marker on the map where the point of
interest is located. Clicking on the marker will show some information about
the location such as the name, Yelp rating score, Yelp image of the location,
and a snippet of text from Yelp's data.

Clicking on a location that already has a marker displayed on the map will cause
the marker to be removed (so, the location name functions as a toggle for
the map marker).

See Installation/Use below for a few additional details on using the app.

Requirements (from Udacity)
###########################

How will I complete this Project?

1.  Review our course JavaScript Design Patterns.
2.  Download the Knockout framework.
3.  Write code required to add a full-screen map to your page using the 
    Google Maps API.
4.  Write code required to add map markers identifying a number of locations 
    your are interested in within this neighborhood.
5.  Implement the search bar functionality to search and filter your map markers. 
    There should be a filtering function on markers that already show up. 
    Simply providing a search function through a third-party API is not enough.
6.  Implement a list view of the identified locations.
7.  Add additional functionality using third-party APIs when a map marker, 
    search result, or list view entry is clicked (ex. Yelp reviews, Wikipedia, 
    Flickr images, etc). If you need a refresher on making AJAX requests to 
    third-party servers, check out our Intro to AJAX course.


Instructor Notes (From Udacity)
###############################

--- Searching and Filtering 
We expect your application to provide a search/filter option on the existing 
map markers that are already displayed. If a list of locations already shows up 
on a map, we expect your application to offer a search function that filters
this existing list. The list view and the markers should update accordingly in 
real-time. Simply providing a searchfunction through a third-party API is not 
enough to meet specifications.

--- What does "errors are handled gracefully" mean?
In case of error (e.g. in a situation where a third party api does not return 
the expected result) we expect your webpage to do one of the following:

A message shows up to notify the user that the data can't be loaded, OR 
There are no negative repercussions to the UI.

Note: Please note that we expect students to handle errors if the browser has 
trouble initially reaching the 3rd-party site as well. For example, imagine a 
user is using your neighborhood map, but her firewall prevents her from accessing
the Instagram servers.


#### -B- PROJECT FILES ####

Within the project files you will find the following:
a)  css, images, js, and partials: these directories all contain required
    project files and should be downloaded to your local machine or uploaded
    to a web server.
b)  index.html: the main page for the application. This file is required.
c)  project-meta: contains notes and rubric for the project itself. This directory
    is not required to make the project run.
d)  Gruntfile.js and package.json: these two files provide some project/task
    automation functions and are only relevant to developers who may wish
    to alter the project. This directory is not required to make the project run.
e)  README.md: this file. Not required to make the project run.
f)  production: this  directory contains a complete copy of ONLY the needed
    files to make the project run. As you'll see in Installation, the easiest
    way to download and run the project is to just copy this directory and
    ignore all the other files and directories.
    
    
#### -C- INSTALLATION/USE ####

To INSTALL this application, follow these steps:
a)  Download ONLY the 'production' directory to your local machine. This folder
    contains a copy of only the required production files for the application
    to run.
b)  If you wish to run this application from a web server, copy the 'production'
    directory to an appropriate location on your web server and point your
    browser to the index.html file located inside the production directory.
c)  If you wish to run this application locally, open the index.html file within
    the 'production' directory to your preferred web browser and the app will
    run.
    
To RUN this application, follow the installation steps and open the index.html
file and you will land on the application page. When the page loads, the
default display will be a listing of all the points of interest on the left
side of the screen and a map of the Las Vegas Strip in the center. Initially,
the map will be "bare" (no location markers). You will also find a Filter
drop-down menu in the center above the map.

To see where a particular Point of Interest is located, simply click on the
name of the POI in the list on the left and a map marker will appear at the
appropriate location on the map. You can click multiple POI's and the marker
for each appears as you click.

To remove a marker, click on the location name in the list a second time. The
location name serves as a toggle for the marker. If not displayed and you
click the name, the marker appears and vice versa.

For any markers active on the screen, you can click it and an informational
window will appear at the top of the map with more information about that
point of interest such as the current Yelp Rating, name, thumbnail image of
the location, a description of the location, and an informational snippet of
text from Yelp's database. Click the X in the upper-right corner of the info
window to make it go away. Note that choosing a filter from the drop-down will
also close the info window. Clicking on another map marker will cause the
info window to display info for the marker you just clicked.

If you wish to filter the locations by category (i.e., Dining, Lodging), 
select the desired category from the drop-down and the list will update and
contain only those locations that match the chosen category. If a map marker
was already displayed for a location that is no longer visible due to filtering,
the marker will be automatically removed.


#### -D- CUSTOMIZING THE APP ####

NOTE: Attempting to customize the app is at the user's risk. At worst, if you
make "fatal" changes, you can simply delete the 'production' directory and
re-download it and start over.

The only customization that is even remotely recommended is modifying the list
of points of interest. All locations are listed as JSON objects inside a file
named locations.json, which is contained within the js directory in a subdirectory
named 'data.' You can edit this file with your preferred text editor. The
structure of an entry is described below:

id:         A numeric value. Should be unique, but not required to be. This field is more
            for future use.
            
name:       The name of the point of interest. For best results, this should
            be a very close or even identical name as to what you find on Yelp.
            Whatever name you put here will be displayed in the info window
            and also used by the application to retrieve Yelp data.
            
category:   The category you want to assign the location to. Arbitrary - use
            how you will.
            
lat:        The latitude of the location. It is strongly suggested that you
            use at least 4 to 5 decimal places of precision for optimal results.
            
long:       The longitude of the location. Again, use 4-5 decimal places.

description:Your personal description of the location. This will appear in 
            the info window below the name.
            
isVisible:  A field used by the application to keep track of whether or not
            the marker for the location is currently visible. ALWAYS set this
            to false in the locations.json file.