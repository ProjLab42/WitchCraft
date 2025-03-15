import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { profileAPI } from '@/services/api.service';

export const TestRunner = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testAddCustomSection = async () => {
    setRunning(true);
    addLog('Testing add custom section...');
    try {
      // Get the current profile
      const profile = await profileAPI.getProfile();
      addLog('Current profile sections: ' + Object.keys(profile.sections || {}).join(', '));
      
      // Create a test custom section
      const sectionName = 'Test Section ' + Date.now();
      const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
      addLog(`Creating section: ${sectionName} (${sectionKey})`);
      
      // Add the custom section to the sections
      const updatedSections = {
        ...profile.sections,
        sectionMeta: {
          ...profile.sections.sectionMeta,
          [sectionKey]: { name: sectionName, deletable: true, renamable: true }
        },
        customSections: {
          ...profile.sections.customSections,
          [sectionKey]: {
            id: `custom-${Date.now()}`,
            title: sectionName,
            content: "",
            items: []
          }
        }
      };
      
      // Update the profile with the new sections
      addLog('Sending update to backend...');
      
      const response = await profileAPI.updateProfile({
        sections: updatedSections
      });
      
      addLog('Custom section added successfully');
      addLog('Response sections: ' + Object.keys(response.sections || {}).join(', '));
      addLog('Custom sections: ' + Object.keys(response.sections.customSections || {}).join(', '));
      
      return { response, sectionKey };
    } catch (error) {
      addLog('Add custom section failed: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setRunning(false);
    }
  };

  const testAddCustomItem = async () => {
    setRunning(true);
    addLog('Testing add custom item...');
    try {
      // Get the current profile
      const profile = await profileAPI.getProfile();
      addLog('Current profile sections: ' + Object.keys(profile.sections || {}).join(', '));
      
      // Find a custom section to add an item to
      const customSections = profile.sections.customSections;
      const customSectionKeys = Object.keys(customSections);
      
      if (customSectionKeys.length === 0) {
        addLog('No custom sections found. Creating one first...');
        
        // Create a test custom section
        const sectionName = 'Test Section ' + Date.now();
        const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
        
        // Add the custom section to the sections
        const updatedSections = {
          ...profile.sections,
          sectionMeta: {
            ...profile.sections.sectionMeta,
            [sectionKey]: { name: sectionName, deletable: true, renamable: true }
          },
          customSections: {
            ...profile.sections.customSections,
            [sectionKey]: {
              id: `custom-${Date.now()}`,
              title: sectionName,
              content: "",
              items: []
            }
          }
        };
        
        // Update the profile with the new sections
        addLog('Creating custom section: ' + sectionKey);
        
        const updatedProfile = await profileAPI.updateProfile({
          sections: updatedSections
        });
        
        addLog('Custom section created successfully');
        
        // Use the updated profile
        profile.sections = updatedProfile.sections;
        customSectionKeys.push(sectionKey);
      }
      
      // Select the first custom section
      const sectionKey = customSectionKeys[0];
      addLog('Using custom section: ' + sectionKey);
      
      // Create a new item for the custom section
      const newItem = {
        id: `item-${Date.now()}`,
        title: 'Test Item ' + Date.now(),
        subtitle: 'Test Subtitle',
        date: '2025',
        description: 'Test Description',
        bulletPoints: [
          {
            id: `bp-${Date.now()}`,
            text: 'Test bullet point'
          }
        ]
      };
      
      // Get the current section
      const currentSection = profile.sections.customSections[sectionKey];
      
      // Create updated sections data
      const updatedSections = {
        ...profile.sections,
        customSections: {
          ...profile.sections.customSections,
          [sectionKey]: {
            ...currentSection,
            items: [...(currentSection.items || []), newItem]
          }
        }
      };
      
      // Update the profile with the new item
      addLog('Adding item to custom section: ' + sectionKey);
      
      const response = await profileAPI.updateProfile({
        sections: updatedSections
      });
      
      addLog('Custom item added successfully');
      addLog('Updated section items count: ' + response.sections.customSections[sectionKey].items.length);
      
      return { response, sectionKey };
    } catch (error) {
      addLog('Add custom item failed: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test Runner</CardTitle>
        <CardDescription>Run tests to verify functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testAddCustomSection} 
              disabled={running}
              variant="outline"
            >
              Test Add Custom Section
            </Button>
            <Button 
              onClick={testAddCustomItem} 
              disabled={running}
              variant="outline"
            >
              Test Add Custom Item
            </Button>
            <Button 
              onClick={clearLogs} 
              disabled={running}
              variant="ghost"
            >
              Clear Logs
            </Button>
          </div>
          
          <Card className="bg-muted">
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Test Logs</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[400px] rounded-md border">
              <CardContent>
                <pre className="text-xs">
                  {logs.map((log, i) => (
                    <div key={i} className="py-1 border-b border-border/20 last:border-0">
                      {log}
                    </div>
                  ))}
                </pre>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {running ? 'Running test...' : 'Ready to run tests'}
        </div>
      </CardFooter>
    </Card>
  );
}; 