import os
import json
import glob
import requests

def download_lodcloud_data(url):
    """
    Download JSON file from URL.
    
    Args:
        url: URL of the JSON file
    
    Returns:
        dict: Parsed JSON data
    """
    print(f"Downloading JSON from {url}...")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()  # Raise an error for bad status codes
        
        data = response.json()
        print("JSON downloaded successfully!")
        return data
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading JSON: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        raise

def filter_json_by_kg_ids(json_data, kg_ids):
    """
    Filter JSON data to keep only keys that match KG IDs from CSV.
    
    Args:
        json_data: The JSON data (dict)
        kg_ids: Set of KG IDs to keep
    """
    # Filter the JSON data
    if isinstance(json_data, dict):
        filtered_data = {key: value for key, value in json_data.items() if key in kg_ids}
    else:
        raise ValueError("JSON data must be a dictionary/object at the root level")
    
    print(f"Original keys: {len(json_data)}")
    print(f"Filtered keys: {len(filtered_data)}")
    print(f"Keys removed: {len(json_data) - len(filtered_data)}")
    
    return filtered_data

def create_list_and_move(data_to_convert):

    lodcloud_data_list = []
    # Create a list of dictionaries
    for key in data_to_convert:
        item = data_to_convert[key]
        if '_id' in item and item['_id'] == '':
            item['_id'] = item['identifier']
        lodcloud_data_list.append(data_to_convert[key])

    absolute_path = os.path.abspath(os.path.join('..','..','WebApp/backend/'))
    with open(absolute_path + '/AccessibleLOD_data.json', 'w') as f:
        json.dump(lodcloud_data_list, f, indent=4)

def find_new_resources_from_kghb_data():


    return kg_ids_list

def merge_cloud_with_new_resources(path_dataset_to_include_in_the_cloud):
    kg_ids = find_new_resources_from_kghb_data()

    lodcloud_data = download_lodcloud_data('https://lod-cloud.net/versions/latest/lod-data.json')
    filtered_json_from_lodc = filter_json_by_kg_ids(lodcloud_data,kg_ids)
    
    filtered_json_from_lodc.append(path_dataset_to_include_in_the_cloud)
    
    merged_data = {}
    for path in reversed(filtered_json_from_lodc):
        path = os.path.abspath(path)
        with open(path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            merged_data.update(data)
    
    return merged_data

#accessibleLOD_data = merge_cloud_with_new_resources('../data/AccessibleLOD_data.json')
create_list_and_move(accessibleLOD_data)