import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface MenuItem {
  name: string;
  description: string;
  course: 'Starters' | 'Main' | 'secondi' | 'dessert';
  price: number;
}

const styles = StyleSheet.create({
  // ... (previous styles remain the same)
  filterContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#E4D4C8',
    borderRadius: 4,
  },
  statsContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F2E8CF',
    borderRadius: 4,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#A7754D',
    padding: 10,
    borderRadius: 4,
  },
  navButton: {
    color: 'white',
    padding: 8,
  },
});

const App: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'add' | 'filter'>('home');
  const [isLoading, setIsLoading] = useState(false);

  const calculateAveragePrice = (course: string): number => {
    const courseItems = menuItems.filter(item => item.course === course);
    if (courseItems.length === 0) return 0;
    const total = courseItems.reduce((sum, item) => sum + item.price, 0);
    return total / courseItems.length;
  };

  const addMenuItem = (item: MenuItem): void => {
    setIsLoading(true);
    setTimeout(() => {
      setMenuItems([...menuItems, item]);
      setIsLoading(false);
      setCurrentScreen('home');
    }, 1000);
  };

  const deleteMenuItem = (index: number) => {
    Alert.alert('Delete Menu Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          const updatedMenuItems = menuItems.filter((_, i) => i !== index);
          setMenuItems(updatedMenuItems);
        },
      },
    ]);
  };

  const editMenuItem = (index: number, updatedItem: MenuItem) => {
    const updatedMenuItems = menuItems.map((item, i) => (i === index ? updatedItem : item));
    setMenuItems(updatedMenuItems);
  };

  return (
    <View style={styles.app}>
      <View style={styles.navigationBar}>
        <Button 
          title="Home" 
          onPress={() => setCurrentScreen('home')} 
          color="#8E3200"
        />
        <Button 
          title="Add Item" 
          onPress={() => setCurrentScreen('add')} 
          color="#8E3200"
        />
        <Button 
          title="Filter Menu" 
          onPress={() => setCurrentScreen('filter')} 
          color="#8E3200"
        />
      </View>

      {currentScreen === 'home' && (
        <HomeScreen 
          menuItems={menuItems}
          averagePrices={{
            Starters: calculateAveragePrice('Starters'),
            Main: calculateAveragePrice('Main'),
            secondi: calculateAveragePrice('secondi'),
            dessert: calculateAveragePrice('dessert'),
          }}
          onDeleteItem={deleteMenuItem}
          onEditItem={editMenuItem}
        />
      )}
      {currentScreen === 'add' && (
        <AddMenuItem  onAddItem={addMenuItem} isLoading={isLoading} />
      )}
      {currentScreen === 'filter' && (
        <FilterScreen menuItems={menuItems} />
      )}
    </View>
  );
};

interface HomeScreenProps {
  menuItems: MenuItem[];
  averagePrices: Record<string, number>;
  onDeleteItem: (index: number) => void;
  onEditItem: (index: number, updatedItem: MenuItem) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  menuItems, 
  averagePrices, 
  onDeleteItem, 
  onEditItem 
}) => {
  return (
    <View>
      <Text style={styles.header}>Christoffel's Menu</Text>
      
      <View style={styles.statsContainer}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Average Prices by Course
        </Text>
        {Object.entries(averagePrices).map(([course, price]) => (
          <View key={course} style={styles.statItem}>
            <Text>{course}:</Text>
            <Text>R{price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyList}>No menu items yet.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color:'#8E3200' }}>{item.name}</Text>
            <Text style={{ fontSize:14,color:'#555'}}>{item.description}</Text>
            <Text style={{ fontSize:14,fontStyle:'italic'}}>{item.course}</Text>
            <Text style={{ fontSize:16,fontWeight:'bold',color:'#4F8A10'}}>R{item.price.toFixed(2)}</Text>
            <View style={styles.buttonRow}>
              <Button title="Edit" onPress={() => onEditItem(index, item)} />
              <Button title="Delete" onPress={() => onDeleteItem(index)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

interface FilterScreenProps {
  menuItems: MenuItem[];
}

const FilterScreen: React.FC<FilterScreenProps> = ({ menuItems }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  
  const filteredItems = selectedCourse === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.course === selectedCourse);

  return (
    <View>
      <Text style={styles.header}>Filter Menu Items</Text>
      
      <View style={styles.filterContainer}>
        <Text>Select Course:</Text>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue: string) => setSelectedCourse(itemValue)}
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Picker.Item label="All Courses" value="all" />
          <Picker.Item label="Starters" value="Starters" />
          <Picker.Item label="Main" value="Main" />
          <Picker.Item label="Secondi" value="secondi" />
          <Picker.Item label="Dessert" value="dessert" />
        </Picker>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyList}>No items found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color:'#8E3200' }}>{item.name}</Text>
            <Text style={{ fontSize:14,color:'#555'}}>{item.description}</Text>
            <Text style={{ fontSize:14,fontStyle:'italic'}}>{item.course}</Text>
            <Text style={{ fontSize:16,fontWeight:'bold',color:'#4F8A10'}}>R{item.price.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
};

// AddItemScreen component remains the same as in your original code

export default App;