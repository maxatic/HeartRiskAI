#import data from csv to db

from django.core.management.base import BaseCommand
import pandas as pd
from predictor.models import HeartRiskRecord
import os

class Command(BaseCommand):
    help = 'Import Heart Risk data from CSV'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to the CSV file', required=True)

    def handle(self, *args, **kwargs):
        file_path = kwargs['file']
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(f'Importing data from {file_path}...')
        
        try:
            df = pd.read_csv(file_path)
            
            # Expected columns map to model fields
            # CSV: Age, Gender, Heart rate, Systolic blood pressure, Diastolic blood pressure, Blood sugar, CK-MB, Troponin, Result
            
            records = []
            for _, row in df.iterrows():
                record = HeartRiskRecord(
                    age=row['Age'],
                    gender=row['Gender'],
                    heart_rate=row['Heart rate'],
                    systolic_bp=row['Systolic blood pressure'],
                    diastolic_bp=row['Diastolic blood pressure'],
                    blood_sugar=row['Blood sugar'],
                    ck_mb=row['CK-MB'],
                    troponin=row['Troponin'],
                    result=row['Result']
                )
                records.append(record)
            
            HeartRiskRecord.objects.bulk_create(records)
            
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(records)} records'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing data: {str(e)}'))
