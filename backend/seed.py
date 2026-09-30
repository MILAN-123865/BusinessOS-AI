import asyncio
import os
import sys
import uuid
import random
from datetime import datetime, timedelta, timezone, date

# Setup paths to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.config.settings import settings
from app.core.security import get_password_hash
from app.config.database import Base
from app.models.organization import Organization
from app.models.department import Department
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole
from app.models.client import Client, ClientContact
from app.models.project import Project
from app.models.task import Task
from app.models.activity import Activity
from app.models.notification import Notification
from app.models.calendar import CalendarEvent, Meeting
from app.models.document import Document
from app.models.finance import Invoice, Expense
from app.models.commerce import Product, Order, Inventory, AnalyticsData

engine = create_async_engine(str(settings.DATABASE_URL), echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ==============================================================================
# NORTHWIND REAL DATA CONSTANTS
# ==============================================================================

NORTHWIND_CATEGORIES = [
    (1, "Beverages", "Soft drinks, coffees, teas, beers, and ales"),
    (2, "Condiments", "Sweet and savory sauces, relishes, spreads, and seasonings"),
    (3, "Confections", "Desserts, candies, and sweet breads"),
    (4, "Dairy Products", "Cheeses, specialty dairy, butter, and cream"),
    (5, "Grains & Cereals", "Breads, crackers, pasta, and cereal"),
    (6, "Meat & Poultry", "Prepared meats and fine poultry"),
    (7, "Produce", "Dried fruit, specialty produce, and bean curd"),
    (8, "Seafood", "Seaweed, fresh catches, and prepared fish"),
]

NORTHWIND_EMPLOYEES = [
    (1, "Nancy Davolio", "Sales Representative", "New York", "USA", 8, "nancy.davolio@northwind.com"),
    (2, "Andrew Fuller", "Vice President Sales", "New York", "USA", None, "andrew.fuller@northwind.com"),
    (3, "Janet Leverling", "Sales Representative", "New York", "USA", 8, "janet.leverling@northwind.com"),
    (4, "Margaret Peacock", "Sales Representative", "New York", "USA", 8, "margaret.peacock@northwind.com"),
    (5, "Steven Buchanan", "Sales Manager", "London", "UK", 2, "steven.buchanan@northwind.com"),
    (6, "Michael Suyama", "Sales Representative", "London", "UK", 5, "michael.suyama@northwind.com"),
    (7, "Robert King", "Sales Representative", "London", "UK", 5, "robert.king@northwind.com"),
    (8, "Laura Callahan", "Sales Manager", "New York", "USA", 2, "laura.callahan@northwind.com"),
    (9, "Anne Dodsworth", "Sales Representative", "London", "UK", 5, "anne.dodsworth@northwind.com"),
]

NORTHWIND_CUSTOMERS = [
    ("ALFKI", "Alfreds Futterkiste", "Maria Anders", "Sales Representative", "Berlin", "Germany"),
    ("ANATR", "Ana Trujillo Emparedados y helados", "Ana Trujillo", "Owner", "Mexico City", "Mexico"),
    ("ANTON", "Antonio Moreno Taquería", "Antonio Moreno", "Owner", "Mexico City", "Mexico"),
    ("AROUT", "Around the Horn", "Thomas Hardy", "Sales Representative", "London", "UK"),
    ("BERGS", "Berglunds snabbköp", "Christina Berglund", "Order Administrator", "Luleå", "Sweden"),
    ("BLAUS", "Blauer See Delikatessen", "Hanna Moos", "Sales Representative", "Mannheim", "Germany"),
    ("BLONP", "Blondesddsl père et fils", "Frédérique Citeaux", "Marketing Manager", "Strasbourg", "France"),
    ("BOLID", "Bólido Comidas preparadas", "Martín Sommer", "Owner", "Madrid", "Spain"),
    ("BONAP", "Bon app'", "Laurence Lebihan", "Owner", "Marseille", "France"),
    ("BOTTM", "Bottom-Dollar Markets", "Elizabeth Lincoln", "Accounting Manager", "Tsawassen", "Canada"),
    ("BSBEV", "B's Beverages", "Victoria Ashworth", "Sales Representative", "London", "UK"),
    ("CACTU", "Cactus Comidas para llevar", "Patricio Simpson", "Sales Agent", "Buenos Aires", "Argentina"),
    ("CENTC", "Centro comercial Moctezuma", "Francisco Chang", "Marketing Manager", "Mexico City", "Mexico"),
    ("CHOPS", "Chop-suey Chinese", "Yang Wang", "Owner", "Bern", "Switzerland"),
    ("COMMI", "Comércio Mineiro", "Pedro Afonso", "Sales Associate", "Sao Paulo", "Brazil"),
    ("CONSH", "Consolidated Holdings", "Elizabeth Brown", "Sales Representative", "London", "UK"),
    ("DRACD", "Drachenblut Delikatessen", "Sven Ottlieb", "Order Administrator", "Aachen", "Germany"),
    ("DUMON", "Du monde entier", "Janine Labrune", "Owner", "Nantes", "France"),
    ("EASTC", "Eastern Connection", "Ann Devon", "Sales Agent", "London", "UK"),
    ("ERNSH", "Ernst Handel", "Roland Mendel", "Sales Manager", "Graz", "Austria"),
    ("FAMIA", "Familia Arquibaldo", "Aria Cruz", "Marketing Assistant", "Sao Paulo", "Brazil"),
    ("FISSA", "FISSA Fabrica Inter. Salchichas S.A.", "Diego Roel", "Accounting Manager", "Madrid", "Spain"),
    ("FOLIG", "Folies gourmandes", "Martine Rancé", "Assistant Sales Agent", "Lille", "France"),
    ("FOLKO", "Folk och fä HB", "Maria Larsson", "Owner", "Bräcke", "Sweden"),
    ("FRANK", "Frankenversand", "Peter Franken", "Marketing Manager", "München", "Germany"),
    ("FRANR", "France restauration", "Carine Schmitt", "Marketing Manager", "Nantes", "France"),
    ("FRANS", "Franchi S.p.A.", "Paolo Accorti", "Sales Representative", "Torino", "Italy"),
    ("FURIB", "Furia Bacalhau e Frutos do Mar", "Lino Rodriguez", "Sales Manager", "Lisboa", "Portugal"),
    ("GALED", "Galería del gastrónomo", "Eduardo Saavedra", "Marketing Manager", "Barcelona", "Spain"),
    ("GODOS", "Godos Cocina Típica", "José Pedro Freyre", "Sales Manager", "Sevilla", "Spain"),
    ("GOURL", "Gourmet Lanchonetes", "André Fonseca", "Sales Associate", "Campinas", "Brazil"),
    ("GREAL", "Great Lakes Food Market", "Howard Snyder", "Marketing Manager", "Eugene", "USA"),
    ("GROSR", "GROSELLA-Restaurante", "Manuel Pereira", "Owner", "Caracas", "Venezuela"),
    ("HANAR", "Hanari Carnes", "Mario Pontes", "Accounting Manager", "Rio de Janeiro", "Brazil"),
    ("HILAA", "HILARION-Abastos", "Carlos Hernández", "Sales Representative", "San Cristóbal", "Venezuela"),
    ("HUNGC", "Hungry Coyote Import Store", "Yoshi Latimer", "Sales Representative", "Elgin", "USA"),
    ("HUNGO", "Hungry Owl All-Night Grocers", "Patricia McKenna", "Sales Associate", "Cork", "Ireland"),
    ("ISLAT", "Island Trading", "Helen Bennett", "Marketing Manager", "Cowes", "UK"),
    ("KOENE", "Königlich Essen", "Philip Cramer", "Sales Associate", "Brandenburg", "Germany"),
    ("LACOR", "La corne d'abondance", "Daniel Tonini", "Sales Representative", "Versailles", "France"),
    ("LAMAI", "La maison d'Asie", "Annette Roulet", "Sales Manager", "Toulouse", "France"),
    ("LAUGB", "Laughing Bacchus Wine Cellars", "Yoshi Tannamuri", "Marketing Assistant", "Vancouver", "Canada"),
    ("LAZYK", "Lazy K Kountry Store", "John Steel", "Marketing Manager", "Walla Walla", "USA"),
    ("LEHMS", "Lehmanns Marktstand", "Renate Messner", "Sales Representative", "Frankfurt a.M.", "Germany"),
    ("LETSS", "Let's Stop N Shop", "Jaime Yorres", "Owner", "San Francisco", "USA"),
    ("LILAS", "LILA-Supermercado", "Carlos González", "Accounting Manager", "Barquisimeto", "Venezuela"),
    ("LINOD", "LINO-Delicateses", "Felipe Izquierdo", "Owner", "I. de Margarita", "Venezuela"),
    ("LONEP", "Lonesome Pine Restaurant", "Fran Wilson", "Sales Manager", "Portland", "USA"),
    ("MAGAA", "Magazzini Alimentari Riuniti", "Giovanni Rovelli", "Marketing Manager", "Bergamo", "Italy"),
    ("MAISD", "Maison Dewey", "Catherine Dewey", "Sales Agent", "Bruxelles", "Belgium"),
    ("MEREP", "Mère Paillarde", "Jean Fresnière", "Marketing Assistant", "Montréal", "Canada"),
    ("MORGK", "Morgenstern Gesundkost", "Alexander Feuer", "Marketing Assistant", "Leipzig", "Germany"),
    ("NORTS", "North/South", "Simon Crowther", "Sales Associate", "London", "UK"),
    ("OCEAN", "Océano Atlántico Ltda.", "Yvonne Moncada", "Sales Agent", "Buenos Aires", "Argentina"),
    ("OLDWO", "Old World Delicatessen", "Rene Phillips", "Sales Representative", "Anchorage", "USA"),
    ("OTTIK", "Ottilies Käselladen", "Henriette Pfalzheim", "Owner", "Köln", "Germany"),
    ("PARIS", "Paris spécialités", "Marie Bertrand", "Owner", "Paris", "France"),
    ("PERIC", "Pericles Comidas clásicas", "Guillermo Fernández", "Sales Representative", "Mexico City", "Mexico"),
    ("PICCO", "Piccolo und mehr", "Georg Pipps", "Sales Manager", "Salzburg", "Austria"),
    ("PRINI", "Princesa Isabel Vinhos", "Isabel de Castro", "Sales Representative", "Lisboa", "Portugal"),
    ("QUEDE", "Que Delícia", "Bernardo Batista", "Accounting Manager", "Rio de Janeiro", "Brazil"),
    ("QUEEN", "Queen Cozinha", "Lúcia Carvalho", "Marketing Assistant", "Sao Paulo", "Brazil"),
    ("QUICK", "QUICK-Stop", "Horst Kloss", "Accounting Manager", "Cunewalde", "Germany"),
    ("RANCH", "Rancho grande", "Sergio Gutiérrez", "Sales Representative", "Buenos Aires", "Argentina"),
    ("RATTC", "Rattlesnake Canyon Grocery", "Paula Wilson", "Assistant Sales Representative", "Albuquerque", "USA"),
    ("REGGC", "Reggiani Caseifici", "Maurizio Moroni", "Sales Associate", "Reggio Emilia", "Italy"),
    ("RICAR", "Ricardo Adocicados", "Janete Limeira", "Assistant Sales Agent", "Rio de Janeiro", "Brazil"),
    ("RICSU", "Richter Supermarkt", "Michael Holz", "Sales Manager", "Genève", "Switzerland"),
    ("ROMEY", "Romero y tomillo", "Alejandra Camino", "Accounting Manager", "Madrid", "Spain"),
    ("SANTG", "Santé Gourmet", "Jonas Bergulfsen", "Owner", "Stavern", "Norway"),
    ("SAVEA", "Save-a-lot Markets", "Jose Pavarotti", "Sales Representative", "Boise", "USA"),
    ("SEVES", "Seven Seas Imports", "Hari Kumar", "Sales Manager", "London", "UK"),
    ("SIMOB", "Simons bistro", "Jytte Petersen", "Owner", "Kobenhavn", "Denmark"),
    ("SPECD", "Spécialités du monde", "Dominique Perrier", "Marketing Manager", "Paris", "France"),
    ("SPLIR", "Split Rail Beer & Ale", "Art Braunschweiger", "Sales Manager", "Lander", "USA"),
    ("SUPRD", "Suprêmes délices", "Pascale Cartrain", "Accounting Manager", "Charleroi", "Belgium"),
    ("THEBI", "The Big Cheese", "Liz Nixon", "Marketing Manager", "Portland", "USA"),
    ("THECR", "The Cracker Box", "Liu Wong", "Marketing Assistant", "Butte", "USA"),
    ("TOMSP", "Toms Spezialitäten", "Karin Josephs", "Marketing Manager", "Münster", "Germany"),
    ("TORTU", "Tortuga Restaurante", "Miguel Angel Paolino", "Owner", "Mexico City", "Mexico"),
    ("TRADH", "Tradição Hipermercados", "Anabela Domingues", "Sales Representative", "Sao Paulo", "Brazil"),
    ("TRAIH", "Trail's Head Gourmet Provisioners", "Helvetius Nagy", "Sales Associate", "Kirkland", "USA"),
    ("VAFFE", "Vaffeljernet", "Palle Ibsen", "Sales Manager", "Århus", "Denmark"),
    ("VICTE", "Victuailles en stock", "Mary Saveley", "Sales Agent", "Lyon", "France"),
    ("VINET", "Vins et alcools Chevalier", "Paul Henriot", "Accounting Manager", "Reims", "France"),
    ("WANDK", "Die Wandernde Kuh", "Rita Müller", "Sales Representative", "Stuttgart", "Germany"),
    ("WARTH", "Wartian Herkku", "Pirkko Koskitalo", "Accounting Manager", "Oulu", "Finland"),
    ("WELLI", "Wellington Importadora", "Paula Parente", "Sales Manager", "Resende", "Brazil"),
    ("WHITC", "White Clover Markets", "Karl Jablonski", "Owner", "Seattle", "USA"),
    ("WILMK", "Wilman Kala", "Matti Karttunen", "Owner", "Helsinki", "Finland"),
    ("WOLZA", "Wolski Zajazd", "Zbyszek Piestrzeniewicz", "Owner", "Warszawa", "Poland")
]

NORTHWIND_PRODUCTS = [
    (1, "Chai", 18.00, 1),
    (2, "Chang", 19.00, 1),
    (3, "Aniseed Syrup", 10.00, 2),
    (4, "Chef Anton's Cajun Seasoning", 22.00, 2),
    (5, "Chef Anton's Gumbo Mix", 21.35, 2),
    (6, "Grandma's Boysenberry Spread", 25.00, 2),
    (7, "Uncle Bob's Organic Dried Pears", 30.00, 7),
    (8, "Northwoods Cranberry Sauce", 40.00, 2),
    (9, "Mishi Kobe Niku", 97.00, 6),
    (10, "Ikura", 31.00, 8),
    (11, "Queso Cabrales", 21.00, 4),
    (12, "Queso Manchego La Pastora", 38.00, 4),
    (13, "Konbu", 6.00, 8),
    (14, "Tofu", 23.25, 7),
    (15, "Genen Shouyu", 15.50, 2),
    (16, "Pavlova", 17.45, 3),
    (17, "Alice Mutton", 39.00, 6),
    (18, "Carnarvon Tigers", 62.50, 8),
    (19, "Teatime Chocolate Biscuits", 9.20, 3),
    (20, "Sir Rodney's Marmalade", 81.00, 3),
    (21, "Sir Rodney's Scones", 10.00, 3),
    (22, "Gustaf's Knäckebröd", 21.00, 5),
    (23, "Tunnbröd", 9.00, 5),
    (24, "Guaraná Fantástica", 4.50, 1),
    (25, "NuNuCa Nuß-Nougat-Creme", 14.00, 3),
    (26, "Gumbär Gummibärchen", 31.23, 3),
    (27, "Schoggi Schokolade", 43.90, 3),
    (28, "Rössle Sauerkraut", 45.60, 7),
    (29, "Thüringer Rostbratwurst", 123.79, 6),
    (30, "Nord-Ost Matjeshering", 25.89, 8),
    (31, "Gorgonzola Telino", 12.50, 4),
    (32, "Mascarpone Fabioli", 32.00, 4),
    (33, "Geitost", 2.50, 4),
    (34, "Sasquatch Ale", 14.00, 1),
    (35, "Steeleye Stout", 18.00, 1),
    (36, "Inlagd Sill", 19.00, 8),
    (37, "Gravad lax", 26.00, 8),
    (38, "Côte de Blaye", 263.50, 1),
    (39, "Chartreuse verte", 18.00, 1),
    (40, "Boston Crab Meat", 18.40, 8),
    (41, "Jack's New England Clam Chowder", 9.65, 8),
    (42, "Singaporean Hokkien Fried Mee", 14.00, 5),
    (43, "Ipoh Coffee", 46.00, 1),
    (44, "Gula Malacca", 19.45, 2),
    (45, "Rogede sild", 9.50, 8),
    (46, "Spegesild", 12.00, 8),
    (47, "Zaanse koeken", 9.50, 3),
    (48, "Chocolade", 12.75, 3),
    (49, "Maxilaku", 20.00, 3),
    (50, "Valkoinen suklaa", 16.25, 3),
    (51, "Manjimup Dried Apples", 53.00, 7),
    (52, "Filo Mix", 7.00, 5),
    (53, "Perth Pasties", 32.80, 6),
    (54, "Tourtière", 7.45, 6),
    (55, "Pâté chinois", 24.00, 6),
    (56, "Gnocchi di nonna Alice", 38.00, 5),
    (57, "Ravioli Angelo", 19.50, 5),
    (58, "Escargots de Bourgogne", 13.25, 8),
    (59, "Raclette Courdavault", 55.00, 4),
    (60, "Camembert Pierrot", 34.00, 4),
    (61, "Sirop d'érable", 28.50, 2),
    (62, "Tarte au sucre", 49.30, 3),
    (63, "Vegie-spread", 43.90, 2),
    (64, "Wimmers gute Semmelknödel", 33.25, 5),
    (65, "Louisiana Fiery Hot Pepper Sauce", 21.05, 2),
    (66, "Louisiana Cajun Seasoning", 17.00, 2),
    (67, "Laughing Lumberjack Lager", 14.00, 1),
    (68, "Scottish Longbreads", 12.50, 3),
    (69, "Gudbrandsdalsost", 36.00, 4),
    (70, "Outback Lager", 15.00, 1),
    (71, "Flotemysost", 21.50, 4),
    (72, "Mozzarella di Giovanni", 34.80, 4),
    (73, "Röd Kaviar", 15.00, 8),
    (74, "Longlife Tofu", 10.00, 7),
    (75, "Rhönbräu Klosterbier", 7.75, 1),
    (76, "Lakkalikööri", 18.00, 1),
    (77, "Original Frankfurter grüne Soße", 13.00, 2)
]

# Real orders from dataset sample
REAL_ORDERS_SAMPLE = [
    (10248, "VINET", 5, "1996-07-04", 440.00),
    (10249, "TOMSP", 6, "1996-07-05", 1863.40),
    (10250, "HANAR", 4, "1996-07-08", 1552.60),
    (10251, "VICTE", 3, "1996-07-08", 654.06),
    (10252, "SUPRD", 4, "1996-07-09", 3597.90),
    (10253, "HANAR", 3, "1996-07-10", 1444.80),
    (10254, "CHOPS", 5, "1996-07-11", 556.62),
    (10255, "RICSU", 9, "1996-07-12", 2490.50),
    (10256, "WELLI", 3, "1996-07-15", 517.80),
    (10257, "HILAA", 4, "1996-07-16", 1119.90),
    (10258, "ERNSH", 1, "1996-07-17", 1614.88),
    (10259, "CENTC", 4, "1996-07-18", 100.80),
    (10260, "OTTIK", 4, "1996-07-19", 1504.65),
    (10261, "QUEDE", 4, "1996-07-19", 448.00),
    (10262, "RATTC", 8, "1996-07-22", 584.40),
    (10263, "ERNSH", 9, "1996-07-23", 1873.80),
    (10264, "FOLKO", 6, "1996-07-24", 695.62),
    (10265, "BLONP", 2, "1996-07-25", 1176.00),
    (10266, "WARTH", 3, "1996-07-26", 346.56),
    (10267, "FRANK", 4, "1996-07-29", 3536.60),
    (10268, "GROSR", 8, "1996-07-30", 1101.20),
    (10269, "WHITC", 5, "1996-07-31", 642.20),
    (10270, "WARTH", 1, "1996-08-01", 1376.00),
    (10271, "SPLIR", 6, "1996-08-01", 48.00),
    (10272, "RATTC", 6, "1996-08-02", 1456.00),
    (10273, "QUICK", 3, "1996-08-05", 2037.28),
    (10274, "VINET", 6, "1996-08-06", 538.60),
    (10275, "MAGAA", 1, "1996-08-07", 291.84),
    (10276, "TORTU", 8, "1996-08-08", 420.00),
    (10277, "MORGK", 2, "1996-08-09", 1200.80),
    (10278, "BERGS", 8, "1996-08-12", 1488.80),
    (10279, "LEHMS", 8, "1996-08-13", 351.00),
    (10280, "BERGS", 2, "1996-08-14", 613.20),
    (10281, "ROMEY", 4, "1996-08-14", 86.50),
    (10282, "ROMEY", 4, "1996-08-15", 155.40),
    (10283, "LILAS", 3, "1996-08-16", 1414.80),
    (10284, "LEHMS", 4, "1996-08-19", 1358.38),
    (10285, "QUICK", 1, "1996-08-20", 1743.36),
    (10286, "QUICK", 8, "1996-08-21", 3016.00),
    (10287, "RICAR", 8, "1996-08-22", 817.40),
    (10288, "REGGC", 4, "1996-08-23", 89.00),
    (10289, "BSBEV", 7, "1996-08-26", 479.40),
    (10290, "COMMI", 8, "1996-08-27", 2169.00),
    (10291, "QUEDE", 6, "1996-08-27", 503.20),
    (10292, "TRADH", 1, "1996-08-28", 1296.00),
    (10293, "TORTU", 1, "1996-08-29", 848.70),
    (10294, "RATTC", 4, "1996-08-30", 1887.60),
    (10295, "VINET", 2, "1996-09-02", 121.60),
    (10296, "LILAS", 6, "1996-09-03", 1050.60),
    (10297, "BLONP", 5, "1996-09-04", 1420.00),
    (10298, "HUNGO", 6, "1996-09-05", 2645.00),
    (10299, "RICAR", 4, "1996-09-06", 349.50),
    (10300, "MAGAA", 2, "1996-09-09", 608.00),
    (10301, "WANDK", 8, "1996-09-09", 755.00),
    (10302, "SUPRD", 4, "1996-09-10", 2708.80),
    (10303, "GODOS", 8, "1996-09-11", 1162.00),
    (10304, "TORTU", 1, "1996-09-12", 954.40),
    (10305, "OLDWO", 8, "1996-09-13", 3730.00),
    (10306, "ROMEY", 1, "1996-09-16", 498.50),
    (10307, "LONEP", 2, "1996-09-17", 424.00),
    (10308, "ANATR", 7, "1996-09-18", 88.80),
    (10309, "HUNGO", 3, "1996-09-19", 1762.00),
    (10310, "THEBI", 8, "1996-09-20", 336.00),
    (10311, "DUMON", 1, "1996-09-20", 268.80),
    (10312, "WANDK", 2, "1996-09-23", 1614.00),
    (10313, "QUICK", 2, "1996-09-24", 182.40),
    (10314, "RATTC", 1, "1996-09-25", 2120.00),
    (10315, "ISLAT", 4, "1996-09-26", 516.80),
    (10316, "RATTC", 1, "1996-09-27", 2835.00),
    (10317, "LONEP", 6, "1996-09-30", 288.00),
    (10318, "ISLAT", 8, "1996-10-01", 240.40),
    (10319, "TORTU", 7, "1996-10-02", 1191.20),
    (10320, "WARTH", 5, "1996-10-03", 516.00),
    (10321, "ISLAT", 3, "1996-10-03", 144.00),
    (10322, "PERIC", 7, "1996-10-04", 112.00),
    (10323, "KOENE", 4, "1996-10-07", 164.40),
    (10324, "SAVEA", 9, "1996-10-08", 4825.00),
    (10325, "KOENE", 1, "1996-10-09", 1478.70),
    (10326, "BOLID", 4, "1996-10-10", 982.00),
    (10327, "FOLKO", 2, "1996-10-11", 1980.00),
    (10328, "FURIB", 4, "1996-10-14", 1168.00),
    (10329, "SPLIR", 4, "1996-10-15", 4741.00),
    (10330, "LILAS", 3, "1996-10-16", 1799.00),
    (10331, "BONAP", 9, "1996-10-16", 88.50),
    (10332, "MEREP", 3, "1996-10-17", 1928.00),
    (10333, "WARTH", 5, "1996-10-18", 876.50),
    (10334, "VICTE", 8, "1996-10-21", 144.80),
    (10335, "HUNGO", 7, "1996-10-22", 2114.50),
    (10336, "PRINI", 7, "1996-10-23", 316.80),
    (10337, "FRANK", 4, "1996-10-24", 2467.00),
    (10338, "OLDWO", 4, "1996-10-25", 934.50),
    (10339, "MEREP", 2, "1996-10-28", 3263.00),
    (10340, "BONAP", 1, "1996-10-29", 2436.00),
    (10341, "SIMOB", 7, "1996-10-29", 411.60),
    (10342, "FRANK", 4, "1996-10-30", 1740.00),
    (10343, "LEHMS", 4, "1996-10-31", 1584.00),
    (10344, "WHITC", 4, "1996-11-01", 2296.00),
    (10345, "QUICK", 2, "1996-11-04", 2924.80),
    (10346, "RATTC", 3, "1996-11-05", 1684.00),
    (10347, "FAMIA", 4, "1996-11-06", 965.00),
]


async def recreate_database():
    print("Dropping and recreating database tables...")
    async with engine.begin() as conn:
        if engine.dialect.name == "postgresql":
            await conn.execute(text("DROP SCHEMA public CASCADE;"))
            await conn.execute(text("CREATE SCHEMA public;"))
        else:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Tables recreated successfully.")


async def seed_data():
    async with AsyncSessionLocal() as db:
        print("[*] Starting Northwind Real Enterprise Database Seeder...")

        # 1. Organization
        org_id = uuid.uuid4()
        org = Organization(
            id=org_id,
            name="Northwind Traders Inc.",
            slug="northwind-traders",
            description="Global Specialty Food & Beverage Import-Export Enterprise",
            address="One Gourmet Plaza, Suite 400",
            city="New York",
            state="NY",
            country="USA",
            postal_code="10001",
            contact_email="contact@northwind.com",
            contact_phone="+1 (212) 555-0199",
            website="https://northwindtraders.com",
            is_active=True
        )
        db.add(org)
        await db.flush()

        # 2. Permissions
        print("[*] Seeding Permissions Matrix...")
        DEFAULT_PERMISSIONS = [
            ("dashboard.read", "Access to view dashboard overview metrics"),
            ("organization.read", "Access to view organization profile"),
            ("organization.manage", "Access to update organization details"),
            ("departments.read", "Access to view departments"),
            ("departments.manage", "Access to CRUD departments"),
            ("employees.read", "Access to view employees list"),
            ("employees.manage", "Access to CRUD employees"),
            ("roles.read", "Access to view roles"),
            ("roles.manage", "Access to CRUD roles"),
            ("permissions.read", "Access to view system permissions"),
            ("permissions.manage", "Access to configure system RBAC policies"),
            ("projects.read", "Access to view projects"),
            ("projects.manage", "Access to CRUD projects"),
            ("clients.read", "Access to view clients list"),
            ("clients.manage", "Access to CRUD clients"),
            ("documents.read", "Access to view documents list"),
            ("documents.manage", "Access to upload/delete documents"),
        ]
        
        perm_map = {}
        for name, desc in DEFAULT_PERMISSIONS:
            p = Permission(id=uuid.uuid4(), name=name, description=desc)
            db.add(p)
            perm_map[name] = p
        await db.flush()

        # 2b. Roles
        print("[*] Seeding Roles & RBAC...")
        roles = {}
        for role_name in ["Admin", "Manager", "HR", "Employee"]:
            role = Role(id=uuid.uuid4(), name=role_name, description=f"{role_name} Access Level", is_system=True)
            db.add(role)
            roles[role_name] = role
        await db.flush()

        # Admin gets all
        for p in perm_map.values():
            rp = RolePermission(role_id=roles["Admin"].id, permission_id=p.id)
            db.add(rp)
            
        # Manager permissions
        for name in ["dashboard.read", "organization.read", "departments.read", "employees.read", "projects.manage", "projects.read", "clients.manage", "clients.read", "documents.manage", "documents.read"]:
            rp = RolePermission(role_id=roles["Manager"].id, permission_id=perm_map[name].id)
            db.add(rp)

        # HR permissions
        for name in ["dashboard.read", "organization.read", "departments.read", "employees.manage", "employees.read", "roles.read"]:
            rp = RolePermission(role_id=roles["HR"].id, permission_id=perm_map[name].id)
            db.add(rp)

        # Employee permissions
        for name in ["dashboard.read", "organization.read", "departments.read", "projects.read", "documents.read"]:
            rp = RolePermission(role_id=roles["Employee"].id, permission_id=perm_map[name].id)
            db.add(rp)
            
        await db.flush()

        # 3. Real Departments
        print("[*] Seeding Departments...")
        dept_configs = [
            ("Executive Leadership", "EXECUTIVE", "Board & C-Suite strategic steering committee"),
            ("Global Sales & Trading", "SALES", "International customer accounts, wholesale distribution & deal closing"),
            ("Marketing & Brand Growth", "MARKETING", "Global trade shows, client acquisition, and specialty gourmet campaigns"),
            ("Supply Chain & Logistics", "LOGISTICS", "Warehouse fulfillment, cold-chain transport, and shipper coordination"),
            ("Finance & Accounting", "FINANCE", "Billing, receivables, currency hedging, and fiscal audit compliance"),
            ("Human Resources & Talent", "HR", "Workforce onboarding, performance appraisals, and employee relations"),
            ("Product Operations & Quality", "PRODUCT", "Specialty culinary procurement, inspection, and catalog curation")
        ]
        departments = []
        for name, code, desc in dept_configs:
            dept = Department(
                id=uuid.uuid4(),
                organization_id=org_id,
                name=name,
                code=code,
                description=desc,
                is_active=True
            )
            db.add(dept)
            departments.append(dept)

        await db.flush()

        # 4. Real Employees / Users
        print("[*] Seeding Real Northwind Employees & Admin User...")
        hashed_pw = get_password_hash("Admin123!")
        users_map = {}

        # Admin user
        admin_id = uuid.uuid4()
        admin_user = User(
            id=admin_id,
            organization_id=org_id,
            department_id=departments[0].id,
            email="admin@example.com",
            hashed_password=hashed_pw,
            first_name="Milan",
            last_name="Rathod",
            phone_number="+1 (212) 555-0100",
            is_active=True,
            is_superuser=True
        )
        db.add(admin_user)
        db.add(UserRole(user_id=admin_id, role_id=roles["Admin"].id))
        users_map[0] = admin_user

        # 9 Northwind Employees
        for emp_id, full_name, title, city, country, reports_to, email in NORTHWIND_EMPLOYEES:
            parts = full_name.split(" ", 1)
            f_name = parts[0]
            l_name = parts[1] if len(parts) > 1 else ""
            
            # Role mapping
            r_name = "Manager" if "Manager" in title or "Vice President" in title else "Employee"
            
            u_id = uuid.uuid4()
            u = User(
                id=u_id,
                organization_id=org_id,
                department_id=departments[1].id, # Global Sales
                email=email,
                hashed_password=hashed_pw,
                first_name=f_name,
                last_name=l_name,
                phone_number=f"+1 (212) 555-01{emp_id:02d}",
                is_active=True,
                is_superuser=False
            )
            db.add(u)
            db.add(UserRole(user_id=u_id, role_id=roles[r_name].id))
            users_map[emp_id] = u

        await db.flush()

        # 5. Real Clients (91 Northwind Global Customers)
        print(f"[*] Seeding {len(NORTHWIND_CUSTOMERS)} Real Northwind Customer Clients...")
        clients_map = {}
        for cust_id, comp_name, contact_name, contact_title, city, country in NORTHWIND_CUSTOMERS:
            c_id = uuid.uuid4()
            client = Client(
                id=c_id,
                organization_id=org_id,
                company_name=comp_name,
                client_code=cust_id,
                email=f"contact@{cust_id.lower()}.com",
                phone=f"+{random.randint(1, 99)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
                website=f"https://www.{cust_id.lower()}.com",
                address=f"Central Commercial District, {city}",
                city=city,
                country=country,
                status="Active"
            )
            db.add(client)
            
            # Primary Contact Person
            parts = contact_name.split(" ", 1)
            contact = ClientContact(
                id=uuid.uuid4(),
                client_id=c_id,
                name=contact_name,
                designation=contact_title,
                email=f"{parts[0].lower()}.{parts[1].lower() if len(parts) > 1 else 'contact'}@{cust_id.lower()}.com",
                phone=f"+{random.randint(1, 99)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
                is_primary=True
            )
            db.add(contact)
            clients_map[cust_id] = client

        await db.flush()

        # Category Lookup Map
        cat_map = {c_id: c_name for c_id, c_name, _ in NORTHWIND_CATEGORIES}

        # 6. Real Products (77 Northwind Products & Inventory)
        print(f"[*] Seeding {len(NORTHWIND_PRODUCTS)} Real Northwind Catalog Products & Stock...")
        products_map = {}
        for p_id, p_name, unit_price, cat_id in NORTHWIND_PRODUCTS:
            prod_uuid = uuid.uuid4()
            prod = Product(
                id=prod_uuid,
                organization_id=org_id,
                name=p_name,
                sku=f"NW-PROD-{p_id:03d}",
                price=unit_price,
                category=cat_map.get(cat_id, "General Food & Beverages"),
                is_active=True
            )
            db.add(prod)
            
            # Real Inventory level
            inv = Inventory(
                id=uuid.uuid4(),
                organization_id=org_id,
                product_id=prod_uuid,
                quantity=random.randint(25, 450),
                location="Main Fulfillment Center"
            )
            db.add(inv)
            products_map[p_id] = prod

        await db.flush()

        # 7. Real Sales Orders & Financial Invoices
        print(f"[*] Seeding {len(REAL_ORDERS_SAMPLE)} Real Sales Invoices & Customer Orders...")
        total_revenue_acc = 0.0
        for ord_id, cust_code, emp_id, ord_date_str, total_amt in REAL_ORDERS_SAMPLE:
            cust_client = clients_map.get(cust_code)
            sales_rep = users_map.get(emp_id, admin_user)
            
            # Order
            order = Order(
                id=uuid.uuid4(),
                organization_id=org_id,
                customer_id=cust_client.id if cust_client else None,
                order_number=f"ORD-{ord_id}",
                total_amount=total_amt,
                status="Delivered",
                order_date=datetime.strptime(ord_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            )
            db.add(order)

            # Invoice
            inv = Invoice(
                id=uuid.uuid4(),
                organization_id=org_id,
                client_id=cust_client.id if cust_client else None,
                invoice_number=f"INV-1996-{ord_id}",
                amount=total_amt,
                status="Paid",
                due_date=date(1996, 12, 31)
            )
            db.add(inv)
            total_revenue_acc += total_amt

        # Operating Expenses
        expense_categories = [
            ("Cold-Chain Freight & Shipping", 185000.00),
            ("Warehouse Lease & Refrigeration Utilities", 94000.00),
            ("International Customs & Port Tariffs", 68000.00),
            ("Sales Team Commissions & European Travel", 52000.00),
            ("Enterprise Software & Quality Testing", 28000.00),
        ]
        for exp_name, exp_amt in expense_categories:
            exp = Expense(
                id=uuid.uuid4(),
                organization_id=org_id,
                category=exp_name,
                amount=exp_amt,
                expense_date=date.today() - timedelta(days=random.randint(5, 60))
            )
            db.add(exp)

        await db.flush()

        # 8. Real Operational Projects & Tasks
        print("[*] Seeding Operational Projects & Sprints...")
        project_templates = [
            ("Global Cold-Chain Logistics Expansion", "Scaling refrigerated shipping routes across UK, Scandinavia, and DACH region.", 250000.00, "In Progress", "High"),
            ("European Wholesale Accounts Modernization", "Digital order placement and electronic EDI integration for top 50 European clients.", 180000.00, "In Progress", "High"),
            ("Specialty Beverage Line Optimization", "Catalog restructuring for wines, ales, and premium coffee blends.", 120000.00, "Planning", "Medium"),
            ("Dairy Products Quality & FDA Compliance Audit", "Ensuring full French & Italian cheese import certifications.", 75000.00, "In Progress", "Urgent"),
            ("Latin American CRM Expansion", "Onboarding Brazilian, Mexican, and Argentine regional accounts.", 140000.00, "Completed", "Medium"),
        ]

        projects = []
        for p_name, p_desc, p_budget, p_status, p_priority in project_templates:
            proj = Project(
                id=uuid.uuid4(),
                organization_id=org_id,
                client_id=random.choice(list(clients_map.values())).id,
                name=p_name,
                project_code=f"PRJ-{p_name[:3].upper()}",
                description=p_desc,
                status=p_status,
                priority=p_priority,
                budget=p_budget,
                currency="USD",
                estimated_hours=random.randint(150, 400),
                actual_hours=random.randint(60, 200),
                health="Good",
                progress=65 if p_status == "In Progress" else (100 if p_status == "Completed" else 15),
                start_date=date.today() - timedelta(days=90),
                end_date=date.today() + timedelta(days=90),
                project_manager_id=users_map[2].id # Andrew Fuller
            )
            db.add(proj)
            projects.append(proj)
        await db.flush()

        # Real Tasks
        task_data = [
            ("Finalize Hamburg & Rotterdam Cold-Storage Freight Contracts", "Review freight forwarder service level agreements.", "In Progress", "High", 1, 6), # Steven Buchanan / Michael Suyama
            ("Audit Ernst Handel Q3 Wholesale Volume Discount", "Reconcile order quantities and rebate margins for Austrian territory.", "Todo", "Urgent", 2, 1), # Nancy Davolio
            ("Renew French Specialty Cheese Import Sanctions", "Submit paperwork to port authorities for Camembert and Roquefort lines.", "In Progress", "High", 4, 3), # Janet Leverling
            ("Execute DACH Region Key Account Review with Quick-Stop", "Quarterly customer success audit and pricing strategy.", "Todo", "Medium", 2, 4), # Margaret Peacock
            ("Consolidate Mediterranean Seafood Supply Chain Routes", "Optimizing Iberian and Italian port delivery timetables.", "Review", "High", 1, 7), # Robert King
            ("Configure EDI Auto-Invoice Dispatch for Bottom-Dollar Markets", "Automate electronic invoice delivery for Canadian territory.", "Completed", "Medium", 2, 8), # Laura Callahan
            ("Inspect UK Wine & Ale Distribution Cellars", "Quality checks on Scottish Longbreads and Steeleye Stout inventories.", "In Progress", "Low", 3, 9), # Anne Dodsworth
            ("Prepare Q4 Global Sales Executive Board Presentation", "Synthesize worldwide revenue metrics across 91 enterprise client accounts.", "Todo", "Urgent", 2, 0), # Milan Rathod (Admin)
        ]

        for t_title, t_desc, t_status, t_priority, proj_idx, emp_idx in task_data:
            assigned_user = users_map[emp_idx]
            proj_obj = projects[proj_idx - 1]
            task = Task(
                id=uuid.uuid4(),
                organization_id=org_id,
                project_id=proj_obj.id,
                title=t_title,
                description=t_desc,
                status=t_status,
                priority=t_priority,
                assignee_id=assigned_user.id,
                estimated_hours=random.randint(10, 40),
                actual_hours=random.randint(5, 30),
                progress=80 if t_status == "In Progress" else (100 if t_status == "Completed" else 0),
                due_date=date.today() + timedelta(days=random.randint(3, 30))
            )
            db.add(task)

        # 8b. Real Meetings & Calendar Events
        print("[*] Seeding Business Meetings & Calendar Schedules...")
        meeting_data = [
            ("Q4 Global Wholesale Strategy Sync", "Review worldwide sales performance across 91 enterprise accounts.", "Online", users_map[2].id, projects[1].id, 1, 10, 0, 11, 30),
            ("Cold-Chain Logistics Standup", "Rotterdam port refrigerated shipping delivery schedule.", "Room 402 - HQ", users_map[5].id, projects[0].id, 2, 14, 0, 15, 0),
            ("French Specialty Dairy Import Review", "Compliance inspection paperwork with customs brokers.", "Online", users_map[3].id, projects[3].id, 3, 11, 0, 12, 0),
            ("DACH Region Customer Success Audit", "Ernst Handel & Quick-Stop key account pricing renegotiations.", "Boardroom A", users_map[4].id, projects[1].id, 5, 15, 0, 16, 30),
            ("Executive Committee Strategy Session", "Fiscal planning, margins, and CRM telemetry review.", "Executive Suite", users_map[0].id, projects[0].id, 7, 9, 30, 11, 0),
        ]

        for m_title, m_desc, m_room, host_id, prj_id, day_offset, start_h, start_m, end_h, end_m in meeting_data:
            base_date = datetime.now(timezone.utc) + timedelta(days=day_offset)
            m_start = base_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
            m_end = base_date.replace(hour=end_h, minute=end_m, second=0, microsecond=0)
            
            m_id = uuid.uuid4()
            meeting = Meeting(
                id=m_id,
                organization_id=org_id,
                title=m_title,
                agenda=m_desc,
                description=m_desc,
                meeting_type="Online" if "Online" in m_room else "In-Person",
                host_id=host_id,
                project_id=prj_id,
                meeting_link="https://meet.northwind.internal/" + m_title.lower().replace(" ", "-")[:20],
                room=m_room,
                start_time=m_start,
                end_time=m_end,
                status="Scheduled"
            )
            db.add(meeting)

            # Corresponding Calendar Event
            evt = CalendarEvent(
                id=uuid.uuid4(),
                organization_id=org_id,
                title=m_title,
                description=m_desc,
                event_type="Meeting",
                project_id=prj_id,
                meeting_id=m_id,
                start_time=m_start,
                end_time=m_end,
                all_day=False,
                color="#3b82f6",
                location=m_room
            )
            db.add(evt)

        # Standalone Deadlines & Reminders
        deadline_events = [
            ("French Specialty Cheese Import Sanctions Deadline", "Submission cut-off for customs tariff exemption.", "Deadline", 4, 17, 0, 18, 0, "#ef4444"),
            ("Bottom-Dollar Markets Auto-Invoice EDI Go-Live", "Production cutover for Canadian electronic billing.", "Company Event", 6, 9, 0, 10, 0, "#10b981"),
            ("Northwind Annual Global Partner Summit", "Worldwide celebration and supplier awards ceremony.", "Company Event", 12, 9, 0, 18, 0, "#8b5cf6"),
        ]
        for d_title, d_desc, d_type, d_offset, sh, sm, eh, em, col in deadline_events:
            b_date = datetime.now(timezone.utc) + timedelta(days=d_offset)
            evt = CalendarEvent(
                id=uuid.uuid4(),
                organization_id=org_id,
                title=d_title,
                description=d_desc,
                event_type=d_type,
                start_time=b_date.replace(hour=sh, minute=sm, second=0, microsecond=0),
                end_time=b_date.replace(hour=eh, minute=em, second=0, microsecond=0),
                all_day=True if "Summit" in d_title else False,
                color=col,
                location="HQ Plaza"
            )
            db.add(evt)

        # 9. Daily Analytics Telemetry (30 Days)
        print("[*] Seeding 30 Days of Financial Analytics Telemetry...")
        for i in range(30):
            day = date.today() - timedelta(days=29 - i)
            daily_rev = round(random.uniform(8500, 24000), 2)
            daily_exp = round(daily_rev * random.uniform(0.55, 0.72), 2)
            daily_profit = round(daily_rev - daily_exp, 2)
            
            an = AnalyticsData(
                id=uuid.uuid4(),
                organization_id=org_id,
                date=day,
                daily_sales=daily_rev,
                revenue=daily_rev,
                expenses=daily_exp,
                profit=daily_profit,
                visitors=random.randint(1200, 3800),
                conversion_rate=round(random.uniform(3.1, 5.8), 2),
                traffic_sources={"Organic Search": 45, "Direct": 28, "Referrals": 17, "Campaigns": 10}
            )
            db.add(an)

        await db.commit()
        print("[SUCCESS] Northwind Real Data Seeding Completed Successfully!")


async def main():
    await recreate_database()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
