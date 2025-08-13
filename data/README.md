# SignBridge Test Data

This folder contains test data generated for SignBridge, including pose files and SignWriting data for common English words.

## 📁 Files Generated

### CSV File
- **`signbridge_test_data.csv`** - Comprehensive data file with all test data:
  - **Columns**: Word, SignWriting, Pose_File, Status
  - **Format**: Standard CSV format for easy import into any application
  - **Data**: All words, SignWriting notation, pose file references, and status

### Pose Files
Generated pose files for animation:
- `hello.pose` - (Not generated - pose generation failed)
- `thank_you.pose` - 237KB
- `please.pose` - 248KB
- `goodbye.pose` - 701KB
- `yes.pose` - 237KB
- `no.pose` - 322KB
- `help.pose` - 356KB
- `water.pose` - 415KB
- `food.pose` - 319KB
- `family.pose` - 311KB

## 📊 Data Summary

### Test Words
1. **hello** - Basic greeting
2. **thank you** - Common expression
3. **please** - Polite request
4. **goodbye** - Farewell
5. **yes** - Affirmation
6. **no** - Negation
7. **help** - Assistance request
8. **water** - Basic need
9. **food** - Basic need
10. **family** - Important concept

### Generation Results
- **Total Words**: 10
- **Successful**: 9 (90% success rate)
- **Failed**: 1 (hello - pose generation failed)
- **Generated**: 2025-08-13 14:22:29

## 🔧 How to Use

### View Data
```bash
python3 scripts/view_csv_data.py
```

### Create CSV from Existing Data
```bash
python3 scripts/create_csv_from_existing.py
```

### Regenerate All Data
```bash
python3 scripts/generate_test_data.py
```

### Pose Files
The `.pose` files contain animation data that can be used with the pose viewer component in SignBridge. Each file contains the complete animation sequence for the corresponding word.

### SignWriting Data
The SignWriting data is in FSW (Formal SignWriting) format, which can be rendered using the SignWritingRenderer component in the frontend.

## 📈 Success Rate Analysis

- **SignWriting Generation**: 100% success rate
- **Pose Generation**: 90% success rate
- **File Size Range**: 237KB - 701KB per pose file
- **Average Pose File Size**: ~350KB

## 🎯 Use Cases

1. **Testing**: Use these files to test SignBridge functionality
2. **Demo**: Showcase the app's capabilities with common words
3. **Development**: Reference for expected data formats
4. **Documentation**: Examples of generated outputs

## 🔄 Regeneration

To generate new test data with different words, modify the `COMMON_WORDS` list in `scripts/generate_test_data.py` and run the script again.

## 📝 Notes

- The backend API was used to generate all data
- Pose generation takes longer than SignWriting generation
- Some words may fail pose generation due to model limitations
- All data is generated in real-time using the actual SignBridge backend 