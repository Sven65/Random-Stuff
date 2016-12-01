# -*- coding: utf-8 -*-

# Cash register written in python.
#    Copyright 2014 Max Thor
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

# Imports

import os, json, time
from easygui import *
from random import randint

# Variables

items = ""
item = ""
user = ""
reciept = list()
totalPrice = 0

# User Variables. (You can change these)
curr = "$" # The currency symbol to use
storeMsg = "Thank you for shopping at my store! Welcome back!" # The message to show at the end of the receipt

# Functions

def getRand(ints):
	x = 0
	rint = ""
	while x < ints:
		p = randint(0,9)
		rint = rint+str(p)
		x = x+1

	return int(rint)

def load():
	global items
	global item
	File = open('store.json', 'r')
	item = json.load(File)
	items = item['store']
	File.close()


def getInfo(Item, info):
	print(str(Item)+" "+info)
	for x in items:
		if x['id'] == int(Item):
			return x[info]

def printRec():
	global totalPrice
	reca = ""
	recs = []
	recnum = getRand(6)
	recs.append("Receipt Number: "+str(recnum)+'\n')
	recs.append("Served By: "+user+'\n')
	recs.append(time.strftime("%d/%m/%Y %H:%M:%S")+'\n')
	for x in reciept:
		amt = int(x['amt'])
		price = getInfo(x['id'], 'price')	
		total = amt*price
		totalPrice = totalPrice+total
		reca = str(x['amt'])+" x "+str(getInfo(int(x['id']), 'name'))+" at "+curr+str(getInfo(int(x['id']), 'price'))+" Each: "+curr+str(total)
		recs.append(reca+'\n')
	
	recs.append("Total: "+curr+str(totalPrice)+'\n')
	recs.append(storeMsg)
	textbox(msg='Receipt:', title='User: '+user+' - Cash Register 1.0', text=recs, codebox=0)


def checkout():
	os.system("clear")
	print("User: "+user)
	print(reciept)
	printRec()

def shop():
	global reciept
	en = multenterbox(msg='Add items to reciept', title='User: '+user+' - Cash Register 1.0', fields=('Item Id ',  'Amount: '))
	os.system("clear")
	if en[0] == '000':
		checkout()
	else:	
		toApp = dict([('id',int(en[0])), ('amt',int(en[1]))])	
		reciept.append(toApp)
		shop()

def menu():
	os.system("clear")
	choice = indexbox(msg='What to do?', title='User: '+user+' - Cash Register 1.0', choices=('New Customer', 'Add Item'), cancel_choice='Exit')
	print(choice)
	if choice == 0:
		shop()
	elif choice == 1:
		en = multenterbox(msg='Add an item', title='User: '+user+' - Cash Register 1.0', fields=('Item Id ', 'Item Name ', 'Item Price '))
		print(en)
		obj = {'id':int(en[0]),'name':en[1],'price':int(en[2])}
		jso = json.dumps(obj)
		File = open("store.json", 'w')
		# Ugly string fixing		
		string = str(item).replace("]}", "").replace("{u","{").replace("[{u","[{").replace(" u"," ").replace("'",'"')+","+jso+"]}"
		print(string)
		File.write(string)
		File.close()
		load()
		menu()
	else:
		menu()

def login():
	global user
	user = enterbox(msg='Name: ', title='Store Version 1.0')
	menu()

# Main Functionality

# Clear Console
os.system("clear")
# Load Items
load()
# Login
login()


