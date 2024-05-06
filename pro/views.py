from django.shortcuts import render
from .models import our_collection
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import json
from django.http import JsonResponse
from django.http import HttpResponse
from llm import LLMChain 
from rest_framework.response import Response
from django.core import serializers
from django.db import connection

def index(request):
    return HttpResponse('ITS Running')

@csrf_exempt
@api_view(['POST','GET'])
def add_test(request):
    if request.method == 'POST':
        data = request.data
        llm_text = data.get('LLM')
        text_data = data.get('text')
        
        res1 = LLMChain(llm_text, text_data)
        data = {
            'LLM_type': llm_text,
            'input_text': text_data,
            'AI_text' : res1
        }
        our_collection.insert_one(data)
        
        val = our_collection.find().sort('_id', -1).limit(1)
        data = []
        for row in val:
            row['_id'] = str(row['_id'])
            data.append(row)
                   
        return JsonResponse({'data1':data},status=200)
        
    return JsonResponse({'error': 'Invalid request method'}, status=400)  

#    elif request.method == 'GET':
#        val = our_collection.find().sort('_id', -1).limit(1)
#        data = []
#        for row in val:
#            # Convert ObjectId to string
#            row['_id'] = str(row['_id'])
#            data.append(row)
#        return JsonResponse({'data':data},status=200)
    
  
        
    
    

    