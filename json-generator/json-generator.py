import googlemaps
import json


gmaps = googlemaps.Client(key='AIzaSyBwxzwTENmcAmiLA3B85GVuTE2oJbGkh-4', timeout=2)


def generate_coconuts():
    return generate_drinks('coconut')


def generate_lattes():
    return generate_drinks('latte')


# drink_name should reflect the name of the file in which the drink's locations are stored.
def generate_drinks(drink_name):
    drinks = []

    with open('raw-' + drink_name + 's.txt') as building_list:
        # print building_list.read()
        for building_description in building_list:
            response = gmaps.places('Microsoft ' + building_description + ', Washington')
            if response['status'] == 'OK' and response['results']:
                result = response['results'][0]
                location = result['geometry']['location']

                drink = {}
                drink['type'] = drink_name
                drink['building'] = building_description.strip()
                drink['lat'] = location['lat']
                drink['lng'] = location['lng']

                drinks.append(drink)

                print building_description.strip(), drink['lat'], drink['lng']
            else:
                print('Failed to locate ' + building_description)
    return drinks

with open('../drink-information.json', 'w') as building_list:
    drinks = []

    drinks.extend(generate_coconuts())
    drinks.extend(generate_lattes())

    building_list.write(json.dumps(drinks))

