#!/usr/bin/python
#-*- coding: utf-8 -*-

import os
import re
import urllib2
from xml.etree import ElementTree
from pprint import pprint
import urllib2

downloadFolder = 'bilder'
downloadYearStart = 2000
downloadYearStop = 2017
pictureSourceTemplate = 'http://www.dfc-online.de/bildergalerie/bilder-%d/'

if __name__ == "__main__":
    print("Downloader start")
    data = {}
    for year in range(downloadYearStart, downloadYearStop):
        print("bearbeite Jahr %d" %year)
        pictureSource = pictureSourceTemplate % year
        try:
            htmlFile =  ElementTree.parse(urllib2.urlopen(pictureSource)).getroot()
        except urllib2.HTTPError:
            continue
        data[year] = []
        contentList = htmlFile.findall(".//div[@class='sortable-matrix']")
        for content in contentList:
            
            captionList = content.findall(".//h1")
            for captionHTML in captionList:
                caption = re.sub('[:?*<>|\\/"\']', '_', "".join(captionHTML.itertext()))
                
                data[year].append({ 'caption': caption, 'files': [] })
            print "found captions: %d " %len(data[year])
            ImageList = content.findall(".//div[@class='ccgalerie clearover']")
            i = 0
            
            for divHTML in ImageList:
                print "working in index %d" %i
                
                linkList = divHTML.findall(".//a")
                for link in linkList:
                    #Bloody Hack for 2016
                    i = min(len(data[year])-1,i)
                    data[year][i]['files'].append(link.attrib['href'])
                i = i + 1
    
    pprint(data)
    for year in data:
        for section in data[year]:
            folder = os.path.join(downloadFolder,str(year),section['caption'])
            if not os.path.exists(folder):
                os.makedirs(folder)
            i = 1
            for url in section['files']:
                index = "%02d" % i
                file = folder + os.path.sep + index + ".jpg"
                if os.path.exists(file):
                    pass
                    #print "Datei existiert bereits"
                else:
                    print "Downloading %s to %s" %(url,file)
                    filedata = urllib2.urlopen(url)  
                    datatowrite = filedata.read()
                    with open(file, 'wb') as f:  
                        f.write(datatowrite)
                i = i + 1
    print("Downloads abgeschlossen")
