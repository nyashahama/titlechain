use sqlx::PgPool;
use std::collections::BTreeMap;
use uuid::Uuid;

pub async fn run(
    pool: &PgPool,
    run_id: Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let batch_id = crate::db::get_run_batch_id(pool, run_id).await?;

    // Read all stage data for this batch
    let stage_properties = crate::db::read_stage_properties(pool, batch_id).await?;
    let stage_titles = crate::db::read_stage_titles(pool, batch_id).await?;
    let stage_parties = crate::db::read_stage_parties(pool, batch_id).await?;
    let stage_encumbrances = crate::db::read_stage_encumbrances(pool, batch_id).await?;

    // Build lookup maps by title_reference
    let mut titles_by_title: BTreeMap<String, Vec<_>> = BTreeMap::new();
    for t in &stage_titles {
        titles_by_title
            .entry(t.title_reference.clone())
            .or_insert_with(Vec::new)
            .push(t);
    }

    let mut parties_by_title: BTreeMap<String, Vec<_>> = BTreeMap::new();
    for p in &stage_parties {
        parties_by_title
            .entry(p.title_reference.clone())
            .or_insert_with(Vec::new)
            .push(p);
    }

    let mut encumbrances_by_title: BTreeMap<String, Vec<_>> = BTreeMap::new();
    for e in &stage_encumbrances {
        encumbrances_by_title
            .entry(e.title_reference.clone())
            .or_insert_with(Vec::new)
            .push(e);
    }

    // Process each property
    for prop in &stage_properties {
        let fingerprint = entity_resolution::property_fingerprint(
            &prop.municipality_or_deeds_office,
            &prop.title_reference,
        );

        // Upsert core.properties
        let property_id = crate::db::core::upsert_core_property(pool, &fingerprint, prop).await?;

        // Insert title registrations
        if let Some(titles) = titles_by_title.get(&prop.title_reference) {
            for t in titles {
                let reg_id = crate::db::core::insert_core_title_registration(
                    pool,
                    property_id,
                    &t.title_reference,
                    &t.registration_status,
                    t.effective_at,
                )
                .await?;

                crate::db::core::insert_core_source_link(
                    pool,
                    property_id,
                    batch_id,
                    t.source_record_id,
                    "core.title_registrations",
                    reg_id,
                )
                .await?;
            }
        }

        // Insert parties
        if let Some(parties) = parties_by_title.get(&prop.title_reference) {
            for p in parties {
                let party_id = crate::db::core::insert_core_property_party(
                    pool,
                    property_id,
                    &p.party_name,
                    &p.party_role,
                )
                .await?;

                crate::db::core::insert_core_source_link(
                    pool,
                    property_id,
                    batch_id,
                    p.source_record_id,
                    "core.property_parties",
                    party_id,
                )
                .await?;
            }
        }

        // Insert encumbrances
        if let Some(encumbrances) = encumbrances_by_title.get(&prop.title_reference) {
            for e in encumbrances {
                let enc_id = crate::db::core::insert_core_encumbrance(
                    pool,
                    property_id,
                    &e.encumbrance_type,
                    &e.status,
                )
                .await?;

                crate::db::core::insert_core_source_link(
                    pool,
                    property_id,
                    batch_id,
                    e.source_record_id,
                    "core.encumbrances",
                    enc_id,
                )
                .await?;
            }
        }

        // Link the property itself
        crate::db::core::insert_core_source_link(
            pool,
            property_id,
            batch_id,
            prop.source_record_id,
            "core.properties",
            property_id,
        )
        .await?;
    }

    Ok(())
}
