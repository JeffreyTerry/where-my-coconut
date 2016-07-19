import sys
import json

import googlemaps


gmaps = googlemaps.Client(key='AIzaSyBwxzwTENmcAmiLA3B85GVuTE2oJbGkh-4', timeout=2)


def generate_coconuts(operation):
    return generate_drinks('coconut', operation)


def generate_lattes(operation):
    return generate_drinks('latte', operation)


# drink_name should reflect the name of the file in which the drink's locations are stored.
def generate_drinks(drink_name, operation='generate_all'):
    if operation == 'generate_all':
        file_prefix = 'all-'
    elif operation == 'generate_new':
        file_prefix = 'new-'
    else:
        raise ValueError('invalid operation passed to drink generator: "' + operation + '"')

    drinks = []

    with open(file_prefix + drink_name + 's.txt') as building_list:
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

                print(building_description.strip(), drink['lat'], drink['lng'])
            else:
                print('Failed to locate ' + building_description)
    return drinks

def create_json():
    with open('../drink-information.json', 'w') as building_list:
        drinks = []

        drinks.extend(generate_coconuts())
        drinks.extend(generate_lattes())

        building_list.write(json.dumps(drinks))

def update_json():
    with open('../drink-information.json', 'r') as building_list:
        drinks = []

        drinks.extend(json.loads(building_list.read()))
        drinks.extend(generate_coconuts('generate_new'))
        drinks.extend(generate_lattes('generate_new'))

    with open('../drink-information.json', 'w') as building_list:
        building_list.write(json.dumps(drinks))

def print_usage():
    print('Usage:  python json-generator.py [create|update]')

def main():
    if len(sys.argv) != 2:
        print_usage()
    elif sys.argv[1] == 'create':
        create_json()
    elif sys.argv[1] == 'update':
        update_json()
    else:
        print_usage()

main()

