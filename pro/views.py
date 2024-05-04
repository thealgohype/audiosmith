import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
from pymongo import MongoClient
from django.shortcuts import render
from django.http import HttpResponse
from audiosmith.llm import LLMChain 
from .models import MyModel
from rest_framework.response import Response
from rest_framework.decorators import api_view

@csrf_exempt
@api_view(['POST', 'GET'])
def add_data(request):
    if request.method == 'POST':
        json_data = request.body
        data = json.loads(json_data)
        
        if len(data) != 2:
            return JsonResponse({'error': 'Invalid data format'}, status=400)
        
        llm_text = data[0]
        text_data = data[1]
        
        res1 = LLMChain(llm_text, text_data)
        
        my_model = MyModel(field1=text_data, field2=res1)
        my_model.save()
        
        response_data = {
            'message': 'Data Pushed in collection successfully'
        }
        return JsonResponse(response_data, status=200)
    
    elif request.method == 'GET':
        mydata = MyModel.objects.all()
        data1 = [{'LLM_text': item.field2} for item in mydata]
        return Response(data1)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)
