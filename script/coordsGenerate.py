import matplotlib.pyplot as plt
import numpy as np
import json
from shapely.geometry import Point, Polygon
import os

def Random_Points_in_Polygon(polygon, number):
    points = []
    minx, miny, maxx, maxy = polygon.bounds
    while len(points) < number:
        pnt = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
        if polygon.contains(pnt):
            points.append([pnt.x, pnt.y])
    return points

with open('./zone.geojson') as f:
    data = json.load(f)

polygons = []
for index, feature in enumerate(data['features']):
    polygons.append(data['features'][index]['geometry']['coordinates'][0])

allFakePoints = []
for polygon in polygons:
    allFakePoints.append(Random_Points_in_Polygon(Polygon(polygon), 30))

with open('../backend/files/fake_coordinates.json', 'w') as outfile:
    json.dump(allFakePoints, outfile)

'''
xp,yp = polygonP.exterior.xy
plt.plot(xp,yp)

# Plot the list of points
xs = [point.x for point in points]
ys = [point.y for point in points]
plt.scatter(xs, ys,color="red")
plt.show()
'''


