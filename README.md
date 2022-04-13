# Climate Change, Incarceration, and Disability

## Team Members

1. Anna Beck
2. Vignesh Ramachandran

## Final Proposal

### User Personas & Use-Case Scenarios

#### User Profile / Persona 1

Joe is a FEMA employee who wants to learn more about possible climate change impacts for prisons across the United States in order to assess their preparedness for emergency events like wildfires and other devastating heat-related events. He needs access to a geovisualization that offers a synoptic view on the impacts of wildfires and rising heat indexes to prisons in different FEMA regions in order to *compare* and *rank* regions that may need more immediate emergency preparedness action. He wants to *associate* regional *trends* and *patterns* around climate change impacts on prisons with local city and town efforts to create emergency preparedness plans in response to climate change impacts and disasters. 

*Scenario 1 (ONE-WAY LEARNING / OVERLAY):* Upon arriving at the geovisualization, Joe is greeted with a panel that allows her to choose the font size and colors used in the visualizations and details. He selects his options and clicks next. It brings him to a one-way learning material, a story that introduces the map and connections between prisons and climate change impacts using the example of Hurricane Katrina, as well as orienting him to the overlays of different climate impacts (potential heat indexes, wildfire risk). He clicks next again, which offers another story about the connection between disability, incarceration, and climate change impacts using the example of psychiatric facilities, and orienting him to how to use filters to modify the points included on the map. Joe didn’t realize that many psychiatric facilities do not have emergency preparedness plans for climate change impacts and decides to include them in his future analysis. He clicks next once again to reach the “Explore” portion of the map. He is confronted with a map of the United States. He begins visual analysis by selecting the FEMA regions *overlay* and wildfire risk *overlay* to assess wildfire risk across the various FEMA regions which gives him a county level overview of wildfire risk. Joe assesses that FEMA region 9 *ranks* as one of the regions with the highest risk. He *zooms* into FEMA region 9, which includes California. He *filters* to include the points for detention facilities, prisons, jails, and psychiatric facilities, to *compare* facilities across the region, looking for *clusters* where local executive action on emergency preparedness plans may make an outsized impact on improving potential conditions in incarceration facilities facing climate change impacts. 

#### User Profile / Persona 2

Sally is a visually impaired environmental justice advocate working in Louisiana who wants to pass legislation requiring prisons and psychiatric facilities to create emergency response plans that adequately respond to the increasing threats of climate change impacts on disabled and incarcerated people. She needs access to a geovisualization that offers a synoptic view on the variety of possible climate change impacts on these institutions in order to *compare* and *rank* different facilities by vulnerability to particular impacts (like rising heat indexes and flooding) to identify *outliers* that may need rapid action and detect *patterns* that may show the vulnerability of these institutions to climate change impacts. 

*Scenario 2 (RETRIEVE):* Upon arriving at the geovisualization, the Sally is greeted with a panel that allows her to choose the font size and colors used in the visualizations and details. After she has chosen a large font size and color hues that are suitable to her needs, she uses the toolbar to skip ahead to the “Explore” portion of the map. She is already familiar with how to use the map and is using it on her computer to explore climate change impacts in Louisiana in order to make a policy report. She begins visual analysis by selecting an overlay of potential heat indexes by year 2100. She includes *filters* for prisons, detention centers, and psychiatric facilities and then *comparing* points across the state of Louisiana with other nearby states. She assesses that incarceration facilities in southern Louisiana *ranks* as one of the most vulnerable regions to rising temperatures. She then *retrieves* detailed information about the Terrebonne Criminal Justice Complex in Houma, Louisiana, identifying it as an *outlier* that needs rapid action to protect the safety of those incarcerated or detained in psychiatric institutions.

*Scenario 3 (SEARCH):* Sally is having a day with a terrible migraine that limits her ability to look at a computer screen. It’s another hot day in the middle of the summer, and she is feeling climate anxiety about the potential impacts of wildfires on her friends incarcerated at Mariposa County Detention Facility in Mariposa, CA. She uses her keyboard to toggle to the toolbar to reach the “Explore” portion of the map. She begins by *searching* for Mariposa County Detention Facility using her keyboard. The map *zooms* to California and highlights the detention facility. She then selects an *overlay* for wildfire risk. The screen reader reads the detailed information that she *retrieves* about the facility. She assesses that it *ranks* in the 99th percentile for wildfire risk and makes a plan to check in on her friends’ mental health and physical safety more often during the height of fire season in California. 
    
### Requirements Document

#### Data
1. Basemap: Shapefile outline of US with state and county boundaries; natural earth / TIGER 
2. FEMA Boundaries: Outline of FEMA region boundaries. 
3. Prisons, Detention Centers, Jails: CSV file of facility locations ; Department of Homeland Security’s Homeland Infrastructure Foundation-Level Data
4. Psychiatric Facilities: CSV file of facility locations ; Centers for Medicare & Medicaid Services
5. Heat Indexes: Late century projects of number of days at or above certain heat indexes (by county) ; Union of Concerned Scientists 
6. Wildfire Risk: “Risk to Potential Structures” data describes the probability that a fire will burn in a given area, as well as the potential intensity of a fire ; U.S. Forest Service

#### Representation
1. Basemap: Default - OSM (white/black), Satellite - Esri.WorldImagery, from Leaflet Providers Demo
2. Wildfire Risk: Depicted in a brown color ramp
3. Heat Index: Depicted in a red color ramp
4. Legend: Visual description of heat index or wildfire risk (3-5 classes)
5. Context Overlays: county boundaries and FEMA regions boundaries
6. Retrieve (Supplemental Information/Details): More details on county, incarceration and total population, historical and projected heat indexes, and wildfire risk for selected institution (point), all located on side panel

#### Interaction
1. Restricted Zoom / Pan: User can only zoom to state level, at which point the national overview (with a county level choropleth) transforms to points
2. Search: Ability to search for and zoom to state. Ability to search for facility zoom to state, and highlight and retrieve detailed information about the facility.
3. Radio Buttons for Climate Change Impact: Choose which climate change impact data to visualize.
4. Filters for Type of Institution: Filter which types of institutions show be included on map.
5. FEMA/County Boundaries Overlay: Overlay FEMA regions and/or county boundaries
6. Basemap Toggle: Switch between basemaps
7. Text size change: Change text size in sidebar—on tools, retrieve, and legend.
8. Color scheme change: Change between light mode and dark mode.
9. Retrieve in sidebar: Click on or search for a facility for more details on county, incarceration and total population, historical and projected heat indexes, and wildfire risk for selected institution (point), all located on side panel.
10. Toggle between home, stories, and explore in story view
11. Map button on home page that brings you to the map (in side panel) and click on map in home page to enter map

## Wireframe
1. **575 wireframe actual home:** This is the landing page of the map. It serves to decribe what the map is visualizing and provide the opportunity to choose font size and color scheme.
    ![575 wireframe actual home, landing page for the geovisualization](img/575%20wireframe%20actual%20home.png)
2. **575 wireframe story:** shows the stories of this map to aid in learning the map and its function
    ![575 wireframe story, shows what a learning material at story could be](img/575%20wireframe%20story%20final.png )
3. **575 wireframe explore:** shows the zoomed out view of the map in explore mode
    ![575 wireframe explore, shows the zoomed out view of the map in explore mode](img/575%20wireframe%20explore%20final.png)
4. **575 wireframe zoomed in:** is the zoomed in view of the map in explore mode
    ![575 wireframe zoomed in, shows the zoomed in view of the map in explore mode](img/575%20wireframe%20zoomed%20in.png)






