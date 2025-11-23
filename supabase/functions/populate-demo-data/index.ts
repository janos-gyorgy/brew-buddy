import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Populating demo data for user: ${user.id}`)

    // Check if user already has data
    const { data: existingRecipes } = await supabase
      .from('recipes')
      .select('id')
      .limit(1)

    if (existingRecipes && existingRecipes.length > 0) {
      console.log('User already has data, skipping population')
      return new Response(
        JSON.stringify({ message: 'Demo data already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert demo recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: user.id,
          name: 'Classic Green Tea Kombucha',
          description: 'A refreshing and balanced kombucha perfect for beginners',
          batch_size_liters: 4,
          tea_amount_g_per_liter: 7,
          tea_blend_description: 'Organic green tea and white tea blend (3:1 ratio)',
          steep_temperature_c: 80,
          steep_time_minutes: 15,
          sugar_g_per_liter: 70,
          sugar_type: 'Organic cane sugar',
          starter_percentage: 10,
          target_f1_days_min: 7,
          target_f1_days_max: 10,
          target_ph_range: '2.5-3.5',
          target_brix_range: '5-8 Brix',
          intent_or_mood: 'Energizing, Clean',
          element: 'Wood',
          f2_fruit_ideas: 'Peach, Mango, Ginger',
          f2_herb_spice_ideas: 'Mint, Lavender',
          notes: 'Great starter recipe'
        },
        {
          user_id: user.id,
          name: 'Bold Black Tea Booch',
          description: 'Rich and tangy with deeper flavors',
          batch_size_liters: 4,
          tea_amount_g_per_liter: 8,
          tea_blend_description: 'Assam black tea with a touch of oolong',
          steep_temperature_c: 95,
          steep_time_minutes: 10,
          sugar_g_per_liter: 75,
          sugar_type: 'White sugar',
          starter_percentage: 12,
          target_f1_days_min: 5,
          target_f1_days_max: 8,
          target_ph_range: '2.5-3.2',
          target_brix_range: '6-9 Brix',
          intent_or_mood: 'Grounding, Robust',
          element: 'Earth',
          f2_fruit_ideas: 'Blackberry, Cherry, Lemon',
          f2_herb_spice_ideas: 'Cinnamon, Star anise, Cardamom',
          notes: 'Ferments faster than green tea'
        },
        {
          user_id: user.id,
          name: 'Tropical Paradise Blend',
          description: 'Light and fruity base perfect for tropical flavors',
          batch_size_liters: 3,
          tea_amount_g_per_liter: 6,
          tea_blend_description: 'Jasmine green tea with hibiscus flowers',
          steep_temperature_c: 85,
          steep_time_minutes: 12,
          sugar_g_per_liter: 65,
          sugar_type: 'Raw honey',
          starter_percentage: 10,
          target_f1_days_min: 8,
          target_f1_days_max: 12,
          target_ph_range: '2.8-3.5',
          target_brix_range: '4-7 Brix',
          intent_or_mood: 'Uplifting, Joyful',
          element: 'Fire',
          f2_fruit_ideas: 'Pineapple, Passionfruit, Coconut',
          f2_herb_spice_ideas: 'Thai basil, Lemongrass',
          notes: 'Lower sugar for lighter finish'
        }
      ])
      .select()

    if (recipesError || !recipes || recipes.length === 0) {
      console.error('Failed to insert recipes:', recipesError)
      throw new Error('Failed to create demo recipes')
    }

    console.log(`Created ${recipes.length} recipes`)

    // Insert demo batches
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .insert([
        {
          user_id: user.id,
          batch_code: 'GT-2024-001',
          recipe_id: recipes[0].id,
          start_date: '2024-01-15',
          status: 'finished',
          total_volume_liters: 4.0,
          initial_ph: 4.5,
          initial_brix: 8.2,
          ambient_temperature_c: 22,
          vessel_type: 'Glass jar',
          vessel_location: 'Kitchen counter',
          scoby_info: 'Hotel SCOBY, thick and healthy',
          starter_source: 'Previous batch GT-2023-042',
          general_notes: 'Perfect fermentation, nice tang',
          target_ready_date_f1: '2024-01-23'
        },
        {
          user_id: user.id,
          batch_code: 'BT-2024-001',
          recipe_id: recipes[1].id,
          start_date: '2024-02-01',
          status: 'finished',
          total_volume_liters: 4.0,
          initial_ph: 4.3,
          initial_brix: 8.8,
          ambient_temperature_c: 23,
          vessel_type: 'Glass jar',
          vessel_location: 'Kitchen counter',
          scoby_info: 'Same SCOBY as GT-001',
          starter_source: 'GT-2024-001',
          general_notes: 'Darker color, robust flavor',
          target_ready_date_f1: '2024-02-07'
        },
        {
          user_id: user.id,
          batch_code: 'GT-2024-002',
          recipe_id: recipes[0].id,
          start_date: '2024-02-20',
          status: 'fermenting_f1',
          total_volume_liters: 4.0,
          initial_ph: 4.5,
          initial_brix: 8.0,
          ambient_temperature_c: 21,
          vessel_type: 'Glass jar',
          vessel_location: 'Kitchen counter',
          scoby_info: 'Hotel SCOBY',
          starter_source: 'BT-2024-001',
          general_notes: 'Currently fermenting',
          target_ready_date_f1: '2024-02-28'
        },
        {
          user_id: user.id,
          batch_code: 'TP-2024-001',
          recipe_id: recipes[2].id,
          start_date: '2024-03-01',
          status: 'ready_for_f2',
          total_volume_liters: 3.0,
          initial_ph: 4.6,
          initial_brix: 6.5,
          ambient_temperature_c: 22,
          vessel_type: 'Glass jar',
          vessel_location: 'Pantry shelf',
          scoby_info: 'New SCOBY from friend',
          starter_source: 'GT-2024-001',
          general_notes: 'Light and floral, ready for F2',
          target_ready_date_f1: '2024-03-10'
        }
      ])
      .select()

    if (batchesError || !batches || batches.length === 0) {
      console.error('Failed to insert batches:', batchesError)
      throw new Error('Failed to create demo batches')
    }

    console.log(`Created ${batches.length} batches`)

    // Insert demo F2 variants
    const { data: f2Variants, error: f2Error } = await supabase
      .from('f2_variant_batches')
      .insert([
        {
          user_id: user.id,
          parent_batch_id: batches[0].id,
          name: 'Ginger Peach',
          f2_start_date: '2024-01-24',
          f2_status: 'consumed',
          bottle_count: 8,
          bottle_size_liters: 0.5,
          fruits_and_juices: '50g fresh ginger, 100g peach puree per liter',
          priming_sugar_g_per_bottle: 3,
          tasting_rating: 5,
          tasting_notes: 'Perfect carbonation! Spicy and fruity balance',
          expected_ready_date_f2: '2024-01-28'
        },
        {
          user_id: user.id,
          parent_batch_id: batches[0].id,
          name: 'Lavender Lemon',
          f2_start_date: '2024-01-24',
          f2_status: 'consumed',
          bottle_count: 6,
          bottle_size_liters: 0.5,
          fruits_and_juices: '50ml lemon juice per liter',
          herbs_and_spices: '2g dried lavender per bottle',
          priming_sugar_g_per_bottle: 2,
          tasting_rating: 4,
          tasting_notes: 'Subtle floral notes, very refreshing',
          expected_ready_date_f2: '2024-01-28'
        },
        {
          user_id: user.id,
          parent_batch_id: batches[1].id,
          name: 'Cherry Cinnamon',
          f2_start_date: '2024-02-08',
          f2_status: 'ready',
          bottle_count: 8,
          bottle_size_liters: 0.5,
          fruits_and_juices: '150g cherry juice per liter',
          herbs_and_spices: '1 cinnamon stick per bottle',
          priming_sugar_g_per_bottle: 3,
          tasting_rating: 5,
          tasting_notes: 'Like cherry pie! Amazing with the black tea base',
          expected_ready_date_f2: '2024-02-12'
        },
        {
          user_id: user.id,
          parent_batch_id: batches[1].id,
          name: 'Plain + Cardamom',
          f2_start_date: '2024-02-08',
          f2_status: 'ready',
          bottle_count: 6,
          bottle_size_liters: 0.5,
          herbs_and_spices: '3 cardamom pods per bottle',
          priming_sugar_g_per_bottle: 2,
          tasting_rating: 4,
          tasting_notes: 'Sophisticated and warming',
          expected_ready_date_f2: '2024-02-12'
        },
        {
          user_id: user.id,
          parent_batch_id: batches[3].id,
          name: 'Pineapple Basil',
          f2_start_date: '2024-03-11',
          f2_status: 'fermenting',
          bottle_count: 6,
          bottle_size_liters: 0.5,
          fruits_and_juices: '100ml pineapple juice per liter',
          herbs_and_spices: '2-3 Thai basil leaves per bottle',
          priming_sugar_g_per_bottle: 3,
          expected_ready_date_f2: '2024-03-15'
        }
      ])
      .select()

    if (f2Error) {
      console.error('Failed to insert F2 variants:', f2Error)
      throw new Error('Failed to create demo F2 variants')
    }

    console.log(`Created ${f2Variants?.length || 0} F2 variants`)

    // Insert demo fermentation log entries
    const { error: logsError } = await supabase
      .from('fermentation_log_entries')
      .insert([
        {
          user_id: user.id,
          batch_id: batches[0].id,
          timestamp: '2024-01-17T10:00:00Z',
          phase: 'f1',
          ph: 4.2,
          brix: 7.5,
          temperature_c: 22,
          smell_color_notes: 'Sweet tea smell, light amber color',
          taste_notes: 'Still quite sweet',
          actions: 'Checked SCOBY formation'
        },
        {
          user_id: user.id,
          batch_id: batches[0].id,
          timestamp: '2024-01-20T14:00:00Z',
          phase: 'f1',
          ph: 3.5,
          brix: 6.0,
          temperature_c: 23,
          smell_color_notes: 'Vinegar smell developing, darker amber',
          taste_notes: 'Nice tangy balance',
          actions: 'Taste test - almost ready'
        },
        {
          user_id: user.id,
          batch_id: batches[0].id,
          timestamp: '2024-01-23T09:00:00Z',
          phase: 'f1',
          ph: 3.0,
          brix: 5.2,
          temperature_c: 22,
          smell_color_notes: 'Strong vinegar smell, rich color',
          taste_notes: 'Perfect tang!',
          actions: 'Ready for F2 bottling'
        },
        {
          user_id: user.id,
          batch_id: batches[1].id,
          timestamp: '2024-02-04T11:00:00Z',
          phase: 'f1',
          ph: 3.8,
          brix: 7.2,
          temperature_c: 23,
          smell_color_notes: 'Malty smell, deep amber',
          taste_notes: 'Good progress',
          actions: 'SCOBY looking thick'
        },
        {
          user_id: user.id,
          batch_id: batches[2].id,
          timestamp: '2024-02-23T15:00:00Z',
          phase: 'f1',
          ph: 4.0,
          brix: 7.0,
          temperature_c: 21,
          smell_color_notes: 'Sweet and slightly fermented',
          taste_notes: 'Early stages',
          actions: 'Just started'
        }
      ])

    if (logsError) {
      console.error('Failed to insert logs:', logsError)
      throw new Error('Failed to create demo logs')
    }

    console.log('Created fermentation logs')

    // Insert demo starter log
    const { error: starterError } = await supabase
      .from('starter_log')
      .insert([
        {
          user_id: user.id,
          name: 'Hotel SCOBY - Primary',
          creation_date: '2023-12-01',
          status: 'active',
          ph_at_creation: 3.2,
          current_ph: 2.9,
          sugar_g_per_liter: 70,
          tea_blend_description: 'Green and black tea blend',
          notes: 'Original SCOBY from brewing friend, very healthy and active'
        },
        {
          user_id: user.id,
          name: 'Backup SCOBY',
          creation_date: '2024-01-15',
          status: 'active',
          ph_at_creation: 3.5,
          current_ph: 3.2,
          sugar_g_per_liter: 70,
          tea_blend_description: 'Green tea only',
          notes: 'Backup from GT-2024-001 batch'
        }
      ])

    if (starterError) {
      console.error('Failed to insert starter log:', starterError)
      throw new Error('Failed to create demo starter log')
    }

    console.log('Created starter logs')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Demo data populated successfully',
        counts: {
          recipes: recipes.length,
          batches: batches.length,
          f2_variants: f2Variants?.length || 0,
          logs: 5,
          starters: 2
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error populating demo data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
